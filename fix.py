import os
import glob

files = glob.glob('gateway (4)/gateway/controllers/*.py')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'SPRING_URL' in content or 'NODE_URL' in content:
        if 'import os' not in content:
            content = 'import os\n' + content
        content = content.replace('"http://localhost:8001/"', 'os.environ.get("SPRING_URL", "http://localhost:8001/")')
        content = content.replace('"http://127.0.0.1:8002/"', 'os.environ.get("NODE_URL", "http://127.0.0.1:8002/")')
        content = content.replace('"http://localhost:8002/"', 'os.environ.get("NODE_URL", "http://127.0.0.1:8002/")')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
