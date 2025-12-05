# PowerShell bulk migration script for Supabase →REST API

$files = @(
  "src/pages/Vendas.tsx",
  "src/pages/Despesas.tsx",
  "src/pages/Fornecedores.tsx",
  "src/pages/Funcionarios.tsx",
  "src/pages/Servicos.tsx"
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  
  # Determine API based on filename
  $apiName = switch -Wildcard ($file) {
    "*Vendas*" { "salesApi" }
    "*Despesas*" { "expensesApi" }
    "*Fornecedores*" { "suppliersApi" }
    "*Funcionarios*" { "employeesApi" }
    "*Servicos*" { "servicesApi" }
  }
  
  # Replace import
  $content = $content -replace 'import \{ supabase \} from "@/lib/supabase";', "import { $apiName } from `"@/lib/api-client`";"
  
  # Replace .select() patterns
  $content = $content -replace 'const \{ data, error \} = await supabase\.from\([''"](\w+)[''"]\)\.select\([^\)]+\)[^;]*;\s+if \(error\) throw error;\s+return data;', 'return await ' + $apiName + '.getAll();'
  
  # Replace .insert() patterns  
  $content = $content -replace 'const \{ error \} = await supabase\.from\([''"](\w+)[''"]\)\.insert\(\[([^\]]+)\]\);\s+if \(error\) throw error;', 'await ' + $apiName + '.create($2);'
  
  # Replace .update() patterns
  $content = $content -replace 'const \{ error \} = await supabase\.from\([''"](\w+)[''"]\)\.update\(([^\)]+)\)\.eq\([''"]id[''"'], ([^\)]+)\);\s+if \(error\) throw error;', 'await ' + $apiName + '.update($3, $2);'
  
  # Replace .delete() patterns
  $content = $content -replace 'const \{ error \} = await supabase\.from\([''"](\w+)[''"]\)\.delete\(\)\.eq\([''"]id[''"'], ([^\)]+)\);\s+if \(error\) throw error;', 'await ' + $apiName + '.delete($2);'
  
  # Replace .delete().in() patterns
  $content = $content -replace 'const \{ error \} = await supabase\.from\([''"](\w+)[''"]\)\.delete\(\)\.in\([''"]id[''"'], ([^\)]+)\);\s+if \(error\) throw error;', 'await Promise.all($2.map(id => ' + $apiName + '.delete(id)));'
  
  Set-Content $file $content -NoNewline
  Write-Host "✅ Migrated: $file"
}

Write-Host "`n✅ Bulk migration complete!"
