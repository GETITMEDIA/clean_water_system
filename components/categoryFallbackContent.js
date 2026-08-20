/* =========================================================
   categoryFallbackContent — a single representative product
   shown on the homepage/products page for categories that don't
   yet have real catalog entries in data/products.json. Swap a
   category out of this list once it has real products — it'll
   automatically stop being used (see ProductsPage.js).
   ========================================================= */

export const CATEGORY_FALLBACKS = {
  'industrial-commercial-ro-plants': {
    name: '25 LPH RO Plant',
    image: 'assets/products/industrial-ro-plants/25-lph.avif',
    description:
      'Our 25 LPH RO Plant is designed to meet heavy-duty usage in commercial and industrial settings. With its advanced filtration system, this RO plant removes all impurities and contaminants from water, ensuring you get only the purest and safest drinking water.',
    whatsappText: 'Hello, I would like to enquire about the 25 LPH RO Plant.',
  },
  'water-softener-plant': {
    name: 'Water Softener Plant',
    image: 'assets/products/water-treatments/1.avif',
    description:
      'Our advanced water softener plants remove excess hardness caused by calcium and magnesium, protecting your pipes, appliances and skin while extending the life of your entire plumbing system.',
    whatsappText: 'Hello, I would like to enquire about the Water Softener Plant.',
  },
  'iron-removal-plant': {
    name: 'Iron Removal Plant',
    image: 'assets/products/water-treatments/5.1.avif',
    description:
      'Our iron removal filters remove excess iron content present in feed water, with minimum pressure drop — treating hard water by removing minerals and making it soft, while preventing rust and discoloration in pipes and fixtures.',
    whatsappText: 'Hello, I would like to enquire about the Iron Removal Plant.',
  },
  'water-conditioner': {
    name: 'Water Conditioner',
    image: 'assets/products/water-treatments/4.webp',
    description:
      'Our water conditioners prevent limescale build-up in plumbing by changing the chemical make-up of the water — a salt-free alternative to a softener that uses no water and produces no wastewater during operation.',
    whatsappText: 'Hello, I would like to enquire about the Water Conditioner.',
  },
  'sand-filter': {
    name: 'Sand Filter',
    image: 'assets/products/water-treatments/5.avif',
    description:
      'Our sand filters remove suspended, floating and sinkable matter from water, using a multiport valve and an FRP vessel for durability, light weight, flexibility and strength across industrial and commercial installations.',
    whatsappText: 'Hello, I would like to enquire about the Sand Filter.',
  },
  'automatic-level-controller': {
    name: 'Automatic Level Controller',
    image: 'assets/products/Automatic-Level-Controller/1.avif',
    description:
      'A brand new Semi Automatic Water Level Controller. When you need water, START the motor by pressing the START push button. When the water level reaches the top, the motor automatically switches off — no manpower required.',
    whatsappText: 'Hello, I would like to enquire about the Automatic Level Controller.',
  },
};
