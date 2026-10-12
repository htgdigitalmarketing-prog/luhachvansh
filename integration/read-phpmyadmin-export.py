"""Convert trusted-format phpMyAdmin content INSERTs to private JSONL; never execute SQL.
Usage: python integration/read-phpmyadmin-export.py dump.sql new-private-directory
Only string, numeric and NULL literals are accepted. Unsupported syntax fails closed.
"""
import hashlib, json, re, sys
from pathlib import Path

TABLES = {'about','district','gallery','history','join_us','members','news',
          'only_village','shaheed','team','village','village_gallery'}

def values(text, pos):
    rows=[]
    def space(i):
        while i<len(text) and text[i].isspace(): i+=1
        return i
    pos=space(pos)
    while text[pos]=='(':
        pos+=1; row=[]
        while True:
            pos=space(pos)
            if text[pos]=="'":
                pos+=1; chars=[]
                while True:
                    char=text[pos]; pos+=1
                    if char=='\\':
                        escaped=text[pos]; pos+=1
                        chars.append({'0':'\0','n':'\n','r':'\r','t':'\t','b':'\b','Z':'\x1a'}.get(escaped,escaped))
                    elif char=="'":
                        if text[pos:pos+1]=="'": chars.append("'");pos+=1
                        else: break
                    else: chars.append(char)
                value=''.join(chars)
            else:
                match=re.match(r'NULL|[-+]?\d+(?:\.\d+)?',text[pos:])
                if not match: raise ValueError('Unsupported SQL value')
                token=match.group();pos+=len(token)
                value=None if token=='NULL' else float(token) if '.' in token else int(token)
            row.append(value);pos=space(pos)
            if text[pos]==')': pos+=1;break
            if text[pos]!=',': raise ValueError('Invalid field separator')
            pos+=1
        rows.append(row);pos=space(pos)
        if text[pos]==';': return rows,pos+1
        if text[pos]!=',': raise ValueError('Invalid row separator')
        pos=space(pos+1)
    raise ValueError('Missing VALUES tuple')

def parse(text):
    result={};position=0
    pattern=re.compile(r'INSERT INTO `([^`]+)` \(([^\n]+)\) VALUES\s*')
    while match:=pattern.search(text,position):
        table=match[1]
        if table not in TABLES: raise ValueError('Unexpected table: '+table)
        columns=re.findall(r'`([^`]+)`',match[2])
        if any(re.search(r'password|token|secret',c,re.I) for c in columns): raise ValueError('Credential column')
        rows,position=values(text,match.end())
        for row in rows:
            if len(row)!=len(columns): raise ValueError('Column count mismatch')
            result.setdefault(table,[]).append(dict(zip(columns,row)))
    return result

def main():
    source,target=map(Path,sys.argv[1:3])
    root=Path(__file__).resolve().parent.parent
    if target.resolve().is_relative_to(root) and not target.resolve().is_relative_to(root/'.local-integration'):
        raise SystemExit('Output must be private, outside tracked source.')
    data=parse(source.read_text(encoding='utf-8'));target.mkdir(parents=True,exist_ok=False)
    manifest={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'tables':{}}
    for table,rows in data.items():
        out=target/(table+'.jsonl')
        out.write_text(''.join(json.dumps(row,ensure_ascii=False)+'\n' for row in rows),encoding='utf-8')
        manifest['tables'][table]={'rows':len(rows),'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
    (target/'COMPLETE.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps({table:len(rows) for table,rows in data.items()}))

if __name__=='__main__': main()
