import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Migration mappings
const migrations = [
    // API imports - Generic replacements
    {
        search: /import \{ supabase \} from "@\/lib\/supabase";/g,
        replace: (match, file) => {
            // Determine which API to import based on the filename
            const apiMap = {
                'Clientes.tsx': 'customersApi',
                'Produtos.tsx': 'productsApi',
                'Vendas.tsx': 'salesApi',
                'Despesas.tsx': 'expensesApi',
                'Fornecedores.tsx': 'suppliersApi',
                'Funcionarios.tsx': 'employeesApi',
                'Servicos.tsx': 'servicesApi',
                'Estoque.tsx': '{ productsApi, materialsApi }',
                'MaquinasVeiculos.tsx': 'machinesVehiclesApi',
                'NotasFiscais.tsx': 'invoicesApi',
                'PedidosMarketplace.tsx': 'marketplaceOrdersApi',
                'PedidosMarketplaceNovo.tsx': 'marketplaceOrdersApi',
                'Producao.tsx': 'productionOrdersApi',
                'GestaoCaixa.tsx': '{ apiClient }',
                'Dashboard.tsx': '{ dashboardApi }',
                'Relatorios.tsx': '{ customersApi, productsApi, salesApi, expensesApi }',
            };
            const fileName = file.split(/[\\/\\]/).pop();
            const api = apiMap[fileName] || '{ apiClient }';
            return `import ${api} from "@/lib/api-client";`;
        }
    },

    // Query patterns
    {
        search: /await supabase\.from\('(\w+)'\)\.select\([^)]+\)(\.order\([^)]+\))?;?/g,
        replace: (match, table) => {
            const apiName = table + 'Api';
            return `await ${apiName}.getAll()`;
        }
    },

    {
        search: /const \{ data, error \} = await supabase\.from\('(\w+)'\)\.select\([^)]+\)(\.order\([^)]+\))?;\s+if \(error\) throw error;\s+return data;/g,
        replace: (match, table) => {
            const apiName = table + 'Api';
            return `return await ${apiName}.getAll();`;
        }
    },

    // Insert patterns
    {
        search: /const \{ error \} = await supabase\.from\('(\w+)'\)\.insert\(\[?([^\]]+)\]?\);\s+if \(error\) throw error;/g,
        replace: (match, table, data) => {
            const apiName = table + 'Api';
            return `await ${apiName}.create(${data});`;
        }
    },

    // Update patterns
    {
        search: /const \{ error \} = await supabase\.from\('(\w+)'\)\.update\(([^)]+)\)\.eq\('id', ([^)]+)\);\s+if \(error\) throw error;/g,
        replace: (match, table, data, id) => {
            const apiName = table + 'Api';
            return `await ${apiName}.update(${id}, ${data});`;
        }
    },

    // Delete patterns
    {
        search: /const \{ error \} = await supabase\.from\('(\w+)'\)\.delete\(\)\.eq\('id', ([^)]+)\);\s+if \(error\) throw error;/g,
        replace: (match, table, id) => {
            const apiName = table + 'Api';
            return `await ${apiName}.delete(${id});`;
        }
    },

    // Delete multiple (in)
    {
        search: /const \{ error \} = await supabase\.from\('(\w+)'\)\.delete\(\)\.in\('id', ([^)]+)\);\s+if \(error\) throw error;/g,
        replace: (match, table, ids) => {
            const apiName = table + 'Api';
            return `await Promise.all(${ids}.map(id => ${apiName}.delete(id)));`;
        }
    },
];

// Files to migrate
const filesToMigrate = [
    'src/pages/Vendas.tsx',
    'src/pages/Servicos.tsx',
    'src/pages/Relatorios.tsx',
    'src/pages/Produtos.tsx',
    'src/pages/Producao.tsx',
    'src/pages/PedidosMarketplaceNovo.tsx',
    'src/pages/PedidosMarketplace.tsx',
    'src/pages/NotasFiscais.tsx',
    'src/pages/MaquinasVeiculos.tsx',
    'src/pages/GestaoCaixa.tsx',
    'src/pages/Funcionarios.tsx',
    'src/pages/Fornecedores.tsx',
    'src/pages/Estoque.tsx',
    'src/pages/Despesas.tsx',
    'src/pages/Dashboard.tsx',
];

console.log('🚀 Starting Supabase to REST API migration...\n');

let totalChanges = 0;

filesToMigrate.forEach(file => {
    try {
        let content = readFileSync(file, 'utf8');
        const original = content;
        let fileChanges = 0;

        migrations.forEach(({ search, replace }) => {
            const matches = content.match(search);
            if (matches) {
                if (typeof replace === 'function') {
                    content = content.replace(search, (...args) => {
                        fileChanges++;
                        return replace(...args, file);
                    });
                } else {
                    content = content.replace(search, replace);
                    fileChanges += matches.length;
                }
            }
        });

        if (content !== original) {
            writeFileSync(file, content, 'utf8');
            console.log(`✅ ${file}: ${fileChanges} changes`);
            totalChanges += fileChanges;
        } else {
            console.log(`⏭️  ${file}: no changes needed`);
        }
    } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
    }
});

console.log(`\n✅ Migration complete! Total changes: ${totalChanges}`);
