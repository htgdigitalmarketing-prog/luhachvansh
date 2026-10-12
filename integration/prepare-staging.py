"""Build a separate private staging snapshot; source databases remain read-only."""
import hashlib,json,sqlite3,sys,zipfile
from pathlib import Path, PurePosixPath

def main():
    archive,source,target=map(Path,sys.argv[1:4])
    if target.exists(): raise SystemExit('Destination already exists; refusing overwrite.')
    root=Path(__file__).resolve().parent.parent
    if target.resolve().is_relative_to(root) and not target.resolve().is_relative_to(root/'.local-integration'):
        raise SystemExit('Staging output must be private.')
    target.mkdir(parents=True)
    original=sqlite3.connect(archive.resolve().as_uri()+'?mode=ro',uri=True)
    if original.execute('SELECT COUNT(*) FROM accounts').fetchone()[0]:
        raise SystemExit('Archive contains accounts; explicit sanitization is required.')
    db=sqlite3.connect(target/'members.sqlite');original.backup(db);original.close()
    db.executescript('''CREATE TABLE legacy_records(source_table TEXT,source_id TEXT,payload TEXT NOT NULL,review_status TEXT NOT NULL DEFAULT 'unreviewed',PRIMARY KEY(source_table,source_id));
    CREATE TABLE legacy_matches(legacy_id TEXT PRIMARY KEY,payload TEXT NOT NULL);
    CREATE TABLE legacy_media(id TEXT PRIMARY KEY,path TEXT NOT NULL,mime TEXT NOT NULL,source_path TEXT NOT NULL,sha256 TEXT NOT NULL);''')
    manifest=json.loads((source/'content-jsonl/COMPLETE.json').read_text(encoding='utf-8'))
    counts={}
    for table,info in manifest['tables'].items():
        raw=(source/'content-jsonl'/(table+'.jsonl')).read_bytes()
        if hashlib.sha256(raw).hexdigest()!=info['sha256']:raise ValueError('Source hash mismatch')
        rows=[json.loads(line) for line in raw.decode('utf-8').splitlines()]
        if len(rows)!=info['rows']:raise ValueError('Source count mismatch')
        for row in rows:db.execute('INSERT INTO legacy_records(source_table,source_id,payload) VALUES(?,?,?)',(table,str(row['id']),json.dumps(row,ensure_ascii=False)))
        counts[table]=len(rows)
    report=json.loads((source/'reconciliation.json').read_text(encoding='utf-8'))
    for row in report['records']:db.execute('INSERT INTO legacy_matches VALUES(?,?)',(row['legacy_id'],json.dumps(row,ensure_ascii=False)))
    media=target/'legacy-media';media.mkdir();accepted=0;excluded=[]
    for zipname,prefix in [('frontend-img.zip','frontend/img'),('public-frontend-img.zip','public/frontend/img')]:
        with zipfile.ZipFile(source/zipname) as z:
            for item in z.infolist():
                if item.is_dir():continue
                name=PurePosixPath(item.filename)
                if name.is_absolute() or '..' in name.parts or '\\' in item.filename:raise ValueError('Unsafe archive path')
                data=z.read(item);ext=name.suffix.lower()
                mime=('image/jpeg' if ext in ('.jpg','.jpeg') and data.startswith(b'\xff\xd8\xff') else
                      'image/png' if ext=='.png' and data.startswith(b'\x89PNG\r\n\x1a\n') else
                      'application/pdf' if ext=='.pdf' and data.startswith(b'%PDF-') else None)
                if not mime:excluded.append({'archive':zipname,'path':item.filename});continue
                digest=hashlib.sha256(data).hexdigest();file=digest+ext
                (media/file).write_bytes(data)
                source_path=prefix+'/'+('/'.join(name.parts[1:]) if name.parts[0]=='img' else str(name))
                key=hashlib.sha256(source_path.encode()).hexdigest()
                db.execute('INSERT INTO legacy_media VALUES(?,?,?,?,?)',(key,file,mime,source_path,digest));accepted+=1
    db.commit()
    assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    summary={'content_counts':counts,'media_entries':accepted,'excluded':excluded,'people':db.execute('SELECT COUNT(*) FROM people').fetchone()[0],'relationships':db.execute('SELECT COUNT(*) FROM relationships').fetchone()[0],'accounts':db.execute('SELECT COUNT(*) FROM accounts').fetchone()[0]}
    db.close();(target/'reconciliation-manifest.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in summary.items() if k!='excluded'}));print('Excluded non-media entries:',len(excluded))

if __name__=='__main__':main()
