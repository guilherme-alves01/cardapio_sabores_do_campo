const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ASSETS_DIR = path.join(__dirname, '../src/assets');
const BUCKET_NAME = 'product-images';

async function migrate() {
  console.log('--- Iniciando Migração de Imagens ---');
  
  try {
    const files = fs.readdirSync(ASSETS_DIR);
    const { data: products, error: pError } = await supabase.from('products').select('id, name');
    
    if (pError) throw pError;
    console.log(`Produtos no banco: ${products.length}`);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

      console.log(`\nProcessando: ${file}`);
      const filePath = path.join(ASSETS_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      const fileExt = file.split('.').pop();
      const fileName = `${Date.now()}-${file.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      // 1. Upload
      const { error: uError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true
        });

      if (uError) {
        console.error(`  Erro upload: ${uError.message}`);
        continue;
      }

      // 2. Pegar URL Publica
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      console.log(`  Upload OK: ${publicUrl}`);

      // 3. Vincular ao produto
      // Normalização para comparação (remove acentos, espaços e deixa minusculo)
      const normalize = (str) => str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, ''); // Remove tudo que não for letra ou numero

      const normFile = normalize(file.split('.')[0]);
      
      const match = products.find(p => {
        const normName = normalize(p.name);
        return normFile.includes(normName) || normName.includes(normFile);
      });

      if (match) {
        console.log(`  Vinculando a: ${match.name}`);
        const { error: upError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', match.id);
        
        if (upError) console.error(`  Erro update: ${upError.message}`);
      } else {
        console.log(`  Nenhum produto correspondente encontrado.`);
      }
    }

    console.log('\n--- Migração Finalizada ---');
  } catch (err) {
    console.error('Erro geral:', err.message);
  }
}

migrate();
