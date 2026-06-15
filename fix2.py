import glob

for file in glob.glob('gateway (4)/gateway/controllers/*.py'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        'os.environ.get("SPRING_URL", "http://localhost:8001/")', 
        'os.environ.get("SPRING_URL", "http://localhost:8001/").rstrip("/") + "/"'
    )
    content = content.replace(
        'os.environ.get("NODE_URL", "http://127.0.0.1:8002/")', 
        'os.environ.get("NODE_URL", "http://127.0.0.1:8002/").rstrip("/") + "/"'
    )
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
