import fs from 'fs';
import path from 'path';

const componentsDir = 'c:\\Users\\Gilbert_Lopah\\Documents\\fincheck-credit-report\\frontend\\src\\components\\general';
const hooksDir = 'c:\\Users\\Gilbert_Lopah\\Documents\\fincheck-credit-report\\frontend\\src\\hooks';

const components = ['TradeReferencesDetails'];

for (const comp of components) {
    const compPath = path.join(componentsDir, `${comp}.tsx`);
    if (!fs.existsSync(compPath)) {
        console.log(`Missing ${compPath}`);
        continue;
    }
    
    let compCode = fs.readFileSync(compPath, 'utf-8');
    
    // Find hook name
    let hookMatch = compCode.match(/import\s+(use\w+)\s+from\s+['"].*hooks\/(use\w+)['"]/);
    let hookName;
    if (!hookMatch) {
        hookMatch = compCode.match(/(use\w+)\(\{/);
        if (!hookMatch) {
            console.log(`Could not find hook for ${comp}`);
            continue;
        }
        hookName = hookMatch[1];
    } else {
        hookName = hookMatch[1];
    }
    
    const hookPath = path.join(hooksDir, `${hookName}.ts`);
    if (!fs.existsSync(hookPath)) {
        console.log(`Missing hook file ${hookPath}`);
        continue;
    }

    let hookCode = fs.readFileSync(hookPath, 'utf-8');

    // 1. Update component
    // add state={touched} to CustomSubmitButton if not present
    if (!compCode.includes('state = {touched}') && !compCode.includes('state={touched}')) {
        compCode = compCode.replace(/<CustomSubmitButton\s+isPending\s*=\s*\{isPending\}\s*\/>/g, '<CustomSubmitButton\n                        state={touched}\n                        isPending={isPending}\n                    />');
    }
    // Add touched to hook destructuring
    if (!compCode.includes('touched,')) {
        const regex = new RegExp(`const\\s*\\{([\\s\\S]*?)\\}\\s*=\\s*${hookName}\\(`);
        compCode = compCode.replace(regex, (match, p1) => {
            return `const {\n        touched,${p1}} = ${hookName}(`;
        });
    }

    fs.writeFileSync(compPath, compCode);

    // 2. Update hook
    let changedHook = false;
    // Add useState to react imports
    if (!hookCode.includes('useState') && hookCode.includes('import {')) {
        const importMatch = hookCode.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]/);
        if (importMatch) {
            if (!importMatch[1].includes('useState')) {
                hookCode = hookCode.replace(importMatch[0], importMatch[0].replace('{', '{ useState, '));
                changedHook = true;
            }
        } else {
            hookCode = `import { useState } from "react";\n` + hookCode;
            changedHook = true;
        }
    } else if (!hookCode.includes('useState')) {
        hookCode = `import { useState } from "react";\n` + hookCode;
        changedHook = true;
    }

    // Add const [touched, setTouched] = useState(false)
    if (!hookCode.includes('const [touched, setTouched] = useState(false)')) {
        hookCode = hookCode.replace(/const { mutate, isPending } = useInstanceMutation\(\)/g, 'const { mutate, isPending } = useInstanceMutation()\n  const [touched, setTouched] = useState(false)');
        changedHook = true;
    }

    // Add setTouched(true) on onSuccess
    if (!hookCode.includes('setTouched(true)')) {
        hookCode = hookCode.replace(/onSuccess\s*:\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\},/g, (match, args, body) => {
            if (body.includes('setTouched(true)')) return match;
            return `onSuccess : (${args}) => {${body}\n        setTouched(true)\n      },`;
        });
        // also try without brackets if they don't have block
        hookCode = hookCode.replace(/onSuccess\s*:\s*\(([^)]*)\)\s*=>\s*([^{][^,]*),/g, (match, args, expr) => {
            return `onSuccess : (${args}) => {\n        ${expr}\n        setTouched(true)\n      },`;
        });
        changedHook = true;
    }

    // Add touched, to return object
    if (!hookCode.includes('touched,') && hookCode.match(/return\s*\{/)) {
        hookCode = hookCode.replace(/return\s*\{([\s\S]*?)\}/, (match, p1) => {
            return `return {\n    touched,${p1}}`;
        });
        changedHook = true;
    }

    if (changedHook) {
        fs.writeFileSync(hookPath, hookCode);
    }
    
    console.log(`Updated ${comp} and ${hookName}`);
}
