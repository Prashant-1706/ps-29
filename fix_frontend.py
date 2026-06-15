import os

file = 'frontend (3)/frontend/src/lib.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"http://localhost:8000"', 'import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
