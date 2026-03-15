import fs from 'fs';
import path from 'path';

function walk(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (let e of list) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) {
            walk(fp);
        } else if (e.name.endsWith('.ts')) {
            const content = fs.readFileSync(fp, 'utf8');
            let newContent = content.replace(/(from\s+['"][^'"]*)\.js(['"])/g, '$1$2');
            if (content !== newContent) {
                fs.writeFileSync(fp, newContent);
                console.log('Fixed', fp);
            }
        }
    }
}
walk('.');
