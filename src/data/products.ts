import type { Product } from '../types';

/**
 * Lógica Automática:
 * O Vite permite importar todos os arquivos de uma pasta de uma vez usando import.meta.glob.
 * Isso significa que qualquer imagem que você colocar no 'assets' (exceto logotipo, hero, etc)
 * vai virar um produto automaticamente.
 */

const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

// Helper para pegar a URL da imagem pelo nome do arquivo
const getImageUrl = (fileName: string) => {
  const path = `../assets/${fileName}`;
  return imageModules[path] || '';
};

export const products: Product[] = [
  // --- BISCOITOS ---
  {
    id: 'biscoito-amanteigado',
    name: 'Biscoito Amanteigado',
    description: 'Biscoito amanteigado derrete na boca, perfeito para o café.',
    price: 3.00,
    category: 'Biscoitos',
    image: getImageUrl('biscoito amanteigado.jpeg')
  },
  {
    id: 'biscoito-americano-220g',
    name: 'Biscoito Americano (220g)',
    description: 'Tradicional biscoito americano em embalagem de 220g.',
    price: 5.00,
    category: 'Biscoitos',
    image: getImageUrl('biscoito americano de 220g.jpeg')
  },
  {
    id: 'biscoito-americano-400g',
    name: 'Biscoito Americano (400g)',
    description: 'Tradicional biscoito americano em embalagem de 400g.',
    price: 7.00,
    category: 'Biscoitos',
    image: getImageUrl('biscoito americano de 400g.jpeg')
  },
  {
    id: 'biscoito-goiabinha',
    name: 'Biscoito Goiabinha',
    description: 'Biscoito recheado com goiabada artesanal.',
    price: 5.00,
    category: 'Biscoitos',
    image: getImageUrl('biscoito goiabinha.jpeg')
  },
  {
    id: 'especial-coco',
    name: 'Especial de Coco',
    description: 'Biscoito especial com flocos de coco natural.',
    price: 8.00,
    category: 'Biscoitos',
    image: getImageUrl('especial de coco.jpeg')
  },
  {
    id: 'especial-goiaba',
    name: 'Especial de Goiaba',
    description: 'Delicioso biscoito especial sabor goiaba.',
    price: 8.00,
    category: 'Biscoitos',
    image: getImageUrl('especial de goiaba.jpeg')
  },
  {
    id: 'especial-leite-condensado',
    name: 'Especial de Leite Condensado',
    description: 'Biscoito especial feito com leite condensado.',
    price: 8.00,
    category: 'Biscoitos',
    image: getImageUrl('especial de leite condensado.jpeg')
  },
  {
    id: 'beiju-coco',
    name: 'Beiju de Coco',
    description: 'Beiju artesanal feito com coco selecionado.',
    price: 5.00, // Preço mantido como estava antes desta rodada
    category: 'Diversos',
    image: getImageUrl('beiju de coco.jpeg')
  },

  // --- LICORES ---
  {
    id: 'licor-caja',
    name: 'Licor de Cajá',
    description: 'Licor artesanal de cajá, sabor intenso e frutado.',
    price: 20.00,
    category: 'Licores',
    image: getImageUrl('licor de cajá.jpeg')
  },
  {
    id: 'licor-jabuticaba',
    name: 'Licor de Jabuticaba',
    description: 'Licor artesanal de jabuticaba, selecionada e saborosa.',
    price: 25.00,
    category: 'Licores',
    image: getImageUrl('licor de jabuticaba.jpeg'),
    featured: true
  },
  {
    id: 'licor-jenipapo',
    name: 'Licor de Jenipapo',
    description: 'O tradicional licor de jenipapo, maturado naturalmente.',
    price: 20.00,
    category: 'Licores',
    image: getImageUrl('licor de jenipapo.jpeg'),
    featured: true
  },
  {
    id: 'licor-tamarindo',
    name: 'Licor de Tamarindo',
    description: 'Licor de tamarindo com o equilíbrio perfeito entre o doce e o azedo.',
    price: 20.00,
    category: 'Licores',
    image: getImageUrl('licor de tamarindo.jpeg')
  },

  // --- POLPAS ---
  {
    id: 'polpa-abacaxi',
    name: 'Polpa de Abacaxi',
    description: 'Polpa de abacaxi 100% natural, sem conservantes.',
    price: 5.00,
    category: 'Polpas',
    image: getImageUrl('polpa de abacaxi.jpeg')
  },
  {
    id: 'polpa-acerola',
    name: 'Polpa de Acerola',
    description: 'Polpa de acerola rica em vitamina C.',
    price: 5.00,
    category: 'Polpas',
    image: getImageUrl('polpa de acerola.jpeg')
  },
  {
    id: 'polpa-caja',
    name: 'Polpa de Cajá',
    description: 'Polpa de cajá natural e refrescante.',
    price: 5.00,
    category: 'Polpas',
    image: getImageUrl('polpa de cajá.jpeg')
  },
  {
    id: 'polpa-cupuacu',
    name: 'Polpa de Cupuaçu',
    description: 'Polpa de cupuaçu cremosa e saborosa.',
    price: 7.00,
    category: 'Polpas',
    image: getImageUrl('polpa de cupuaçu.jpeg')
  },
  {
    id: 'polpa-goiaba',
    name: 'Polpa de Goiaba',
    description: 'Polpa de goiaba selecionada.',
    price: 5.00,
    category: 'Polpas',
    image: getImageUrl('polpa de goiaba.jpeg')
  },
  {
    id: 'polpa-graviola',
    name: 'Polpa de Graviola',
    description: 'Polpa de graviola pura e natural.',
    price: 7.00,
    category: 'Polpas',
    image: getImageUrl('polpa de graviola.jpeg')
  },
  {
    id: 'polpa-jenipapo',
    name: 'Polpa de Jenipapo',
    description: 'Polpa de jenipapo para sucos e doces.',
    price: 7.00,
    category: 'Polpas',
    image: getImageUrl('polpa de jenipapo.jpeg')
  },
  {
    id: 'polpa-manga',
    name: 'Polpa de Manga',
    description: 'Polpa de manga doce e natural.',
    price: 4.00,
    category: 'Polpas',
    image: getImageUrl('polpa de manga.jpeg'),
    featured: true
  },
  {
    id: 'polpa-maracuja-sem-caroco',
    name: 'Polpa de Maracujá (Sem Caroço)',
    description: 'Polpa de maracujá concentrada e sem sementes.',
    price: 9.00,
    category: 'Polpas',
    image: getImageUrl('polpa de maracujá sem caroço.jpeg')
  },
  {
    id: 'polpa-maracuja',
    name: 'Polpa de Maracujá',
    description: 'Polpa de maracujá natural with seeds.',
    price: 8.00,
    category: 'Polpas',
    image: getImageUrl('polpa de maracujá.jpeg'),
    featured: true
  },
  {
    id: 'polpa-tamarindo',
    name: 'Polpa de Tamarindo',
    description: 'Polpa de tamarindo natural.',
    price: 7.00,
    category: 'Polpas',
    image: getImageUrl('polpa de tamarindo.jpeg')
  },

  // --- SORVETES ---
  {
    id: 'sorvete-uva-1l',
    name: 'Sorvete Natural de Uva (1 Litro)',
    description: 'Sorvete 100% natural sabor uva, embalagem de 1 litro.',
    price: 13.00,
    category: 'Sorvetes',
    image: getImageUrl('sorvete natual 1 litro de uva.jpeg')
  },
  {
    id: 'sorvete-umbu-400ml',
    name: 'Sorvete Natural de Umbu (400ml)',
    description: 'Sorvete artesanal de umbu, sabor típico e refrescante.',
    price: 5.00,
    category: 'Sorvetes',
    image: getImageUrl('Sorvete natural de umbu 400ml.jpeg')
  },
  {
    id: 'sorvete-tamarindo-1l',
    name: 'Sorvete Natural de Tamarindo (1 Litro)',
    description: 'Sorvete 100% natural sabor tamarindo, embalagem de 1 litro.',
    price: 13.00,
    category: 'Sorvetes',
    image: getImageUrl('sorvete natural 1 litro de tamarindo.jpeg')
  },
  {
    id: 'sorvete-uva-400ml',
    name: 'Sorvete Natural de Uva (400ml)',
    description: 'Sorvete artesanal de uva feito com a fruta.',
    price: 5.00,
    category: 'Sorvetes',
    image: getImageUrl('Sorvete natural de uva 400ml.jpeg')
  },
  {
    id: 'sorvete-morango-400ml',
    name: 'Sorvete Natural de Morango (400ml)',
    description: 'Sorvete artesanal de morango 100% natural.',
    price: 5.00, // Ajustar preço
    category: 'Sorvetes',
    image: getImageUrl('sorvete natural de morango 400ml.jpeg'),
    featured: true
  },


  // --- DIVERSOS ---
  {
    id: 'farinha',
    name: 'Farinha de Mandioca',
    description: 'Farinha de mandioca artesanal, crocante e fresquinha.',
    price: 7.00,
    category: 'Diversos',
    image: getImageUrl('farinha.jpeg')
  },
  {
    id: 'farinha-copioba',
    name: 'Farinha de Copioba',
    description: 'Farinha de copioba autêntica, qualidade premium.',
    price: 10.00,
    category: 'Diversos',
    image: getImageUrl('Farinha de copioba.jpeg')
  },
  {
    id: 'tapioca-crocante',
    name: 'Tapioca Crocante',
    description: 'Tapioca crocante ideal para lanches.',
    price: 10.00,
    category: 'Diversos',
    image: getImageUrl('tapioca crocante.jpeg'),
    featured: true
  }
];
