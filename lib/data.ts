export interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  oldPrice: string | null;
  soldText?: string | null;
  progressWidth?: string | null;
  discount?: string | null;
}

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice?: number | null;
  quantity: number;
}

export const categories = [
  {
    name: 'দিনাজপুর লিচু',
    slug: 'dinajpur-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783098570-icon-download.webp',
    hasSubmenu: true,
  },
  {
    name: 'প্রিমিয়াম লিচু',
    slug: 'premium-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783098551-icon-download-(1).webp',
    hasSubmenu: false,
  },
  {
    name: 'রাজশাহী লিচু',
    slug: 'rajshahi-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783098698-icon-pngtree-summer-red-lychee-illustration-png-image_12511947.webp',
    hasSubmenu: false,
  },
  {
    name: 'বোম্বাই লিচু',
    slug: 'bombai-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783099022-icon-1.webp',
    hasSubmenu: false,
  },
  {
    name: 'বেদানা লিচু',
    slug: 'bedana-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783099106-icon-download-(2).webp',
    hasSubmenu: false,
  },
  {
    name: 'চায়না-৩ লিচু',
    slug: 'china-3-licu',
    icon: 'https://demo.scaleuper.com/public/uploads/category/1783099194-icon-pngtree-lychee-on-transparent-background-png-image_20457880.webp',
    hasSubmenu: false,
  },
];

export const heroBanners = [
  {
    id: 1,
    image: 'https://demo.scaleuper.com/public/uploads/banner/1783258416-6a4a5d3013bed-baner1.webp',
    alt: 'সেরা স্বাদের দিনাজপুরের লিচু',
  },
  {
    id: 2,
    image: 'https://demo.scaleuper.com/public/uploads/banner/1783258435-6a4a5d43ae0d7-baner2.webp',
    alt: 'বাগানের তাজা পাকা লিচু হোম ডেলিভারি',
  },
  {
    id: 3,
    image: 'https://demo.scaleuper.com/public/uploads/banner/1783258446-6a4a5d4ea5cdc-baner3.webp',
    alt: 'মিষ্টি রসাল প্রিমিয়াম কোয়ালিটি লিচু',
  },
];

export const promoBanners = [
  'https://demo.scaleuper.com/public/uploads/banner/1783258512-6a4a5d903bad0-slider3.webp',
  'https://demo.scaleuper.com/public/uploads/banner/1783258500-6a4a5d84b79f8-slider2.webp',
  'https://demo.scaleuper.com/public/uploads/banner/1783258484-6a4a5d745871e-slider1.webp',
  'https://demo.scaleuper.com/public/uploads/banner/1783258463-6a4a5d5f9bdfc-slider1.webp',
];

export const flashSaleProducts: Product[] = [
  {
    id: '246',
    title: 'দেশি লিচু ফ্রেশ প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783253731-6a4a4ae39287a-desi-licu-fres-pzak.webp',
    oldPrice: '150',
    price: '1300',
    soldText: 'বিক্রি 10 • বাকি 961',
    progressWidth: '6',
  },
  {
    id: '245',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
    oldPrice: '1200',
    price: '1300',
    soldText: 'বিক্রি 0 • বাকি 970',
    progressWidth: '2',
  },
  {
    id: '244',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258072-6a4a5bd80bfda-organik-baganer-licu.webp',
    oldPrice: '130',
    price: '520',
    soldText: 'বিক্রি 0 • বাকি 974',
    progressWidth: '2',
  },
  {
    id: '243',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258031-6a4a5bafce02d-primiyam-lal-licu.webp',
    oldPrice: '250',
    price: '1250',
    soldText: 'বিক্রি 0 • বাকি 998',
    progressWidth: '1',
  },
  {
    id: '242',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257985-6a4a5b8132a1d-bagan-theke-taja-licu.webp',
    oldPrice: '1250',
    price: '1300',
    soldText: 'বিক্রি 0 • বাকি 974',
    progressWidth: '2',
  },
  {
    id: '241',
    title: 'বাগান থেকে তাজা লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257937-6a4a5b5148647-bagan-theke-taja-licu.webp',
    oldPrice: '1900',
    price: '1300',
    soldText: 'বিক্রি 0 • বাকি 977',
    progressWidth: '2',
  },
  {
    id: '240',
    title: 'লিচু কম্বো ফ্যামিলি বক্স',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257873-6a4a5b1133bdb-licu-kmbo-fzamili-bks.webp',
    oldPrice: '1900',
    price: '1300',
    soldText: 'বিক্রি 0 • বাকি 975',
    progressWidth: '2',
  },
  {
    id: '239',
    title: 'মিষ্টি রসাল লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257785-6a4a5ab982dae-mishti-rsal-licu-pzak.webp',
    oldPrice: '1900',
    price: '1300',
    soldText: 'বিক্রি 0 • বাকি 977',
    progressWidth: '2',
  },
  {
    id: '238',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257684-6a4a5a5450d49-golapi-licu-spesal.webp',
    oldPrice: '1500',
    price: '1200',
    soldText: 'বিক্রি 0 • বাকি 975',
    progressWidth: '2',
  },
  {
    id: '237',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254773-6a4a4ef5c9a04-organik-baganer-licu.webp',
    oldPrice: '1500',
    price: '1200',
    soldText: 'বিক্রি 0 • বাকি 977',
    progressWidth: '2',
  },
];

export const hotDealProducts: Product[] = [
  {
    id: '246',
    title: 'দেশি লিচু ফ্রেশ প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783253731-6a4a4ae39287a-desi-licu-fres-pzak.webp',
    oldPrice: '150',
    price: '1300',
  },
  {
    id: '245',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
    oldPrice: '1200',
    price: '1300',
  },
  {
    id: '244',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258072-6a4a5bd80bfda-organik-baganer-licu.webp',
    oldPrice: '130',
    price: '520',
  },
  {
    id: '243',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258031-6a4a5bafce02d-primiyam-lal-licu.webp',
    oldPrice: '250',
    price: '1250',
  },
  {
    id: '242',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257985-6a4a5b8132a1d-bagan-theke-taja-licu.webp',
    oldPrice: '1250',
    price: '1300',
  },
  {
    id: '241',
    title: 'বাগান থেকে তাজা লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257937-6a4a5b5148647-bagan-theke-taja-licu.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '240',
    title: 'লিচু কম্বো ফ্যামিলি বক্স',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257873-6a4a5b1133bdb-licu-kmbo-fzamili-bks.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '239',
    title: 'মিষ্টি রসাল লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257785-6a4a5ab982dae-mishti-rsal-licu-pzak.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '238',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257684-6a4a5a5450d49-golapi-licu-spesal.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '237',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254773-6a4a4ef5c9a04-organik-baganer-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
];

export const dinajpurProducts: Product[] = [
  {
    id: '246',
    title: 'দেশি লিচু ফ্রেশ প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783253731-6a4a4ae39287a-desi-licu-fres-pzak.webp',
    oldPrice: '150',
    price: '1300',
  },
  {
    id: '245',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
    oldPrice: '1200',
    price: '1300',
  },
  {
    id: '244',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258072-6a4a5bd80bfda-organik-baganer-licu.webp',
    oldPrice: '130',
    price: '520',
  },
  {
    id: '243',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258031-6a4a5bafce02d-primiyam-lal-licu.webp',
    oldPrice: '250',
    price: '1250',
  },
  {
    id: '242',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257985-6a4a5b8132a1d-bagan-theke-taja-licu.webp',
    oldPrice: '1250',
    price: '1300',
  },
  {
    id: '241',
    title: 'বাগান থেকে তাজা লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257937-6a4a5b5148647-bagan-theke-taja-licu.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '240',
    title: 'লিচু কম্বো ফ্যামিলি বক্স',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257873-6a4a5b1133bdb-licu-kmbo-fzamili-bks.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '239',
    title: 'মিষ্টি রসাল লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257785-6a4a5ab982dae-mishti-rsal-licu-pzak.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '238',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257684-6a4a5a5450d49-golapi-licu-spesal.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '237',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254773-6a4a4ef5c9a04-organik-baganer-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
];

export const premiumProducts: Product[] = [
  {
    id: '245',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
    oldPrice: '1200',
    price: '1300',
  },
  {
    id: '236',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254703-6a4a4eafcb512-primiyam-lal-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '235',
    title: 'হোম ডেলিভারি লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254656-6a4a4e804b3ac-hom-delivari-licu-pzak.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '234',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254608-6a4a4e50e62d4-bachai-kra-br-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '233',
    title: 'দিনাজপুর প্রিমিয়াম লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254529-6a4a4e017f4d2-dinajpur-primiyam-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
];

export const allProductsList: Product[] = [
  {
    id: '246',
    title: 'দেশি লিচু ফ্রেশ প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783253731-6a4a4ae39287a-desi-licu-fres-pzak.webp',
    oldPrice: '150',
    price: '1300',
  },
  {
    id: '247',
    title: 'দিনাজপুর লিচু বাজেট প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258180-6a4a5c447e08c-dinajpur-licu-bajet-pzak.webp',
    oldPrice: '1400',
    price: '1300',
  },
  {
    id: '245',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
    oldPrice: '1200',
    price: '1300',
  },
  {
    id: '244',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258072-6a4a5bd80bfda-organik-baganer-licu.webp',
    oldPrice: '130',
    price: '520',
  },
  {
    id: '243',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258031-6a4a5bafce02d-primiyam-lal-licu.webp',
    oldPrice: '250',
    price: '1250',
  },
  {
    id: '242',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257985-6a4a5b8132a1d-bagan-theke-taja-licu.webp',
    oldPrice: '1250',
    price: '1300',
  },
  {
    id: '241',
    title: 'বাগান থেকে তাজা লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257937-6a4a5b5148647-bagan-theke-taja-licu.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '240',
    title: 'লিচু কম্বো ফ্যামিলি বক্স',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257873-6a4a5b1133bdb-licu-kmbo-fzamili-bks.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '239',
    title: 'মিষ্টি রসাল লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257785-6a4a5ab982dae-mishti-rsal-licu-pzak.webp',
    oldPrice: '1900',
    price: '1300',
  },
  {
    id: '238',
    title: 'গোলাপি লিচু স্পেশাল',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257684-6a4a5a5450d49-golapi-licu-spesal.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '237',
    title: 'অর্গানিক বাগানের লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254773-6a4a4ef5c9a04-organik-baganer-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '236',
    title: 'প্রিমিয়াম লাল লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254703-6a4a4eafcb512-primiyam-lal-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '235',
    title: 'হোম ডেলিভারি লিচু প্যাক',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254656-6a4a4e804b3ac-hom-delivari-licu-pzak.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '234',
    title: 'বাছাই করা বড় লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254608-6a4a4e50e62d4-bachai-kra-br-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
  {
    id: '233',
    title: 'দিনাজপুর প্রিমিয়াম লিচু',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783254529-6a4a4e017f4d2-dinajpur-primiyam-licu.webp',
    oldPrice: '1500',
    price: '1200',
  },
];

export const liveNotifications = [
  {
    name: 'আব্দুল করিম',
    location: 'মিরপুর, ঢাকা',
    product: 'দেশি লিচু ফ্রেশ প্যাক',
    time: '১ মিনিট আগে',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783253731-6a4a4ae39287a-desi-licu-fres-pzak.webp',
  },
  {
    name: 'নাসরিন আক্তার',
    location: 'ধানমন্ডি, ঢাকা',
    product: 'গোলাপি লিচু স্পেশাল',
    time: '৩ মিনিট আগে',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258119-6a4a5c071f90b-golapi-licu-spesal.webp',
  },
  {
    name: 'তানভীর আহমেদ',
    location: 'পাঁচলাইশ, চট্টগ্রাম',
    product: 'প্রিমিয়াম লাল লিচু',
    time: '৫ মিনিট আগে',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783258031-6a4a5bafce02d-primiyam-lal-licu.webp',
  },
  {
    name: 'সাদিয়া ইসলাম',
    location: 'উত্তরা, ঢাকা',
    product: 'লিচু কম্বো ফ্যামিলি বক্স',
    time: '৬ মিনিট আগে',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257873-6a4a5b1133bdb-licu-kmbo-fzamili-bks.webp',
  },
  {
    name: 'মাহমুদুল হাসান',
    location: 'বোয়ালিয়া, রাজশাহী',
    product: 'বাগান থেকে তাজা লিচু',
    time: '৮ মিনিট আগে',
    image: 'https://demo.scaleuper.com/public/uploads/product/1783257937-6a4a5b5148647-bagan-theke-taja-licu.webp',
  },
];
