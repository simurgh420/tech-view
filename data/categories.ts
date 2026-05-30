import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Network,
  Plug,
} from 'lucide-react';

export const categories = [
  {
    name: 'Mobile Phones',
    icon: Smartphone,
    link: '/products/category/mobile',
    products: [
      {
        id: 1,
        title: 'iPhone 17',
        image: '/img/categories/iphone.jpg',
        link: '/products/mobile/iphone',
      },
      {
        id: 2,
        title: 'Samsung Galaxy S24',
        image: '/img/categories/galaxy.png',
        link: '/products/mobile/galaxy',
      },
      {
        id: 3,
        title: 'Google Pixel 9',
        image: '/img/products/pixel.png',
        link: '/products/mobile/pixel',
      },
      {
        id: 4,
        title: 'Xiaomi Mi 15',
        image: '/img/products/xiaomi.png',
        link: '/products/mobile/xiaomi',
      },
    ],
  },
  {
    name: 'Laptops & Computers',
    icon: Laptop,
    link: '/products/category/laptops',
    products: [
      {
        id: 5,
        title: 'MacBook Pro',
        image: '/img/categories/macbook.png',
        link: '/products/laptops/macbook',
      },
      { id: 6, title: 'Dell XPS', image: '/img/products/dell.png', link: '/products/laptops/dell' },
      { id: 7, title: 'HP Spectre', image: '/img/products/hp.png', link: '/products/laptops/hp' },
      {
        id: 8,
        title: 'Lenovo ThinkPad',
        image: '/img/products/thinkpad.png',
        link: '/products/laptops/thinkpad',
      },
    ],
  },
  {
    name: 'Tablets & E-reader',
    icon: Tablet,
    link: '/products/category/tablets',
    products: [
      { id: 9, title: 'iPad Pro', image: '/img/products/ipad.png', link: '/products/tablets/ipad' },
      {
        id: 10,
        title: 'Kindle Paperwhite',
        image: '/img/products/kindle.png',
        link: '/products/tablets/kindle',
      },
      {
        id: 11,
        title: 'Samsung Galaxy Tab',
        image: '/img/products/galaxy-tab.png',
        link: '/products/tablets/galaxy-tab',
      },
      {
        id: 12,
        title: 'Microsoft Surface Go',
        image: '/img/products/surface.png',
        link: '/products/tablets/surface',
      },
    ],
  },
  {
    name: 'Wearables',
    icon: Watch,
    link: '/products/category/wearables',
    products: [
      {
        id: 13,
        title: 'Apple Watch',
        image: '/img/products/apple-watch.png',
        link: '/products/wearables/apple-watch',
      },
      {
        id: 14,
        title: 'Fitbit Charge',
        image: '/img/products/fitbit.png',
        link: '/products/wearables/fitbit',
      },
      {
        id: 15,
        title: 'Samsung Galaxy Watch',
        image: '/img/products/galaxy-watch.png',
        link: '/products/wearables/galaxy-watch',
      },
      {
        id: 16,
        title: 'Garmin Forerunner',
        image: '/img/products/garmin.png',
        link: '/products/wearables/garmin',
      },
    ],
  },
  {
    name: 'Audio',
    icon: Headphones,
    link: '/products/category/audio',
    products: [
      {
        id: 17,
        title: 'AirPods Pro',
        image: '/img/products/airpods.png',
        link: '/products/audio/airpods',
      },
      {
        id: 18,
        title: 'Sony WH-1000XM5',
        image: '/img/products/sony-headphones.png',
        link: '/products/audio/sony',
      },
      { id: 19, title: 'Bose QC45', image: '/img/products/bose.png', link: '/products/audio/bose' },
      { id: 20, title: 'JBL Flip 6', image: '/img/products/jbl.png', link: '/products/audio/jbl' },
    ],
  },
  {
    name: 'Cameras',
    icon: Camera,
    link: '/products/category/cameras',
    products: [
      {
        id: 21,
        title: 'Canon EOS R5',
        image: '/img/products/canon.png',
        link: '/products/cameras/canon',
      },
      {
        id: 22,
        title: 'Sony A7 IV',
        image: '/img/products/sony-camera.png',
        link: '/products/cameras/sony',
      },
      {
        id: 23,
        title: 'Nikon Z9',
        image: '/img/products/nikon.png',
        link: '/products/cameras/nikon',
      },
      {
        id: 24,
        title: 'Instax Mini 12 instant',
        image: '/img/products/Instax-mini.png',
        link: '/products/cameras/Instax',
      },
    ],
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    link: '/products/category/gaming',
    products: [
      {
        id: 25,
        title: 'PlayStation 5',
        image: '/img/products/ps5.png',
        link: '/products/gaming/ps5',
      },
      {
        id: 26,
        title: 'Xbox Series X',
        image: '/img/products/xbox.png',
        link: '/products/gaming/xbox',
      },
      {
        id: 27,
        title: 'Nintendo Switch OLED',
        image: '/img/products/switch.png',
        link: '/products/gaming/switch',
      },
      {
        id: 28,
        title: 'Steam Deck',
        image: '/img/products/steamdeck.png',
        link: '/products/gaming/steamdeck',
      },
    ],
  },
  {
    name: 'Networking',
    icon: Network,
    link: '/products/category/networking',
    products: [
      {
        id: 29,
        title: 'TP-Link Router',
        image: '/img/products/router.png',
        link: '/products/networking/router',
      },
      {
        id: 30,
        title: 'Netgear Switch',
        image: '/img/products/router-switch.png',
        link: '/products/networking/switch',
      },
      {
        id: 31,
        title: 'Cisco Firewall',
        image: '/img/products/cisco.png',
        link: '/products/networking/cisco',
      },
      {
        id: 32,
        title: 'Ubiquiti Access Point',
        image: '/img/products/ubiquiti.png',
        link: '/products/networking/ubiquiti',
      },
    ],
  },
  {
    name: 'Accessories',
    icon: Plug,
    link: '/products/category/accessories',
    products: [
      {
        id: 33,
        title: 'Phone Cases',
        image: '/img/products/case.png',
        link: '/products/accessories/case',
      },
      {
        id: 34,
        title: 'Chargers',
        image: '/img/products/charger.png',
        link: '/products/accessories/charger',
      },
      {
        id: 35,
        title: 'Power Banks',
        image: '/img/products/powerbank.png',
        link: '/products/accessories/powerbank',
      },
      {
        id: 36,
        title: 'Screen Protectors',
        image: '/img/products/screen.png',
        link: '/products/accessories/screen',
      },
    ],
  },
];
