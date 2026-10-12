"""Read-only migration assessment. Candidate matches never update either source.
python integration/reconcile-legacy.py <private-export-dir> <member-db> <new-private-report.json>
"""
import hashlib,json,sqlite3,sys,unicodedata
from pathlib import Path
from collections import defaultdict

def normalized(value):
    return ' '.join(unicodedata.normalize('NFKC',str(value or '')).casefold().split())

def assess(rows,people):
    by_name=defaultdict(list)
    for person in people:
        by_name[normalized(person['name'])].append(person)
    source_ids={str(r.get('id')) for r in rows}
    findings=[]
    for row in rows:
        key=str(row.get('id'))
        name=normalized(row.get('name'))
        village=normalized(row.get('birth_place') or row.get('current_city'))
        matches=by_name.get(name,[]) if name else []
        local=[p for p in matches if village and normalized(p['village'])==village]
        candidates=local or matches
        parent=str(row.get('father_id') or '')
        parent_status=('missing_sentinel' if parent=='9999' else 'missing' if not parent or parent=='0' else 'self_link' if parent==key else 'explicit_legacy_link' if parent in source_ids else 'dangling_legacy_link')
        findings.append({'legacy_id':key,'name':row.get('name'),'village':village,
            'parent_id':None if parent_status=='missing_sentinel' else parent,
            'parent_status':parent_status,
            'status':'unmatched' if not candidates else 'ambiguous' if len(candidates)>1 else 'candidate_requires_review',
            'candidate_ids':[p['id'] for p in candidates],
            'basis':'name_and_village' if local else 'name_only' if candidates else 'none'})
    return findings

def main():
    source,db_path,report=map(Path,sys.argv[1:4])
    if report.exists():raise SystemExit('Report already exists; choose a new private path.')
    # Reports contain personal records and must not be placed in source/public trees.
    root=Path(__file__).resolve().parent.parent
    if report.resolve().is_relative_to(root) and not report.resolve().is_relative_to(root/'.local-integration'):
        raise SystemExit('Choose private storage outside the repository or .local-integration.')
    manifest=json.loads((source/'COMPLETE.json').read_text(encoding='utf-8'))
    member_file=source/'members.jsonl'
    expected=manifest['tables']['members']['sha256']
    if hashlib.sha256(member_file.read_bytes()).hexdigest()!=expected:raise SystemExit('Member export hash mismatch.')
    rows=[json.loads(line) for line in member_file.read_text(encoding='utf-8').splitlines() if line.strip()]
    if len(rows)!=manifest['tables']['members']['rows']:raise SystemExit('Member export count mismatch.')
    db=sqlite3.connect(db_path.resolve().as_uri()+'?mode=ro',uri=True);db.row_factory=sqlite3.Row
    people=[dict(p) for p in db.execute('SELECT id,name,village FROM people WHERE active=1')];db.close()
    findings=assess(rows,people)
    counts={state:sum(f['status']==state for f in findings) for state in ['unmatched','ambiguous','candidate_requires_review']}
    report.parent.mkdir(parents=True,exist_ok=True)
    with report.open('x',encoding='utf-8') as f:json.dump({'source_hash':expected,'summary':counts,'notice':'Review candidates only. No IDs merged, relationships inferred, accounts created or sources changed.','records':findings},f,ensure_ascii=False,indent=2)
    print(json.dumps({'assessed':len(rows),'summary':counts,'source_changed':False}))

if __name__=='__main__':main()
