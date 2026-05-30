import { 
  FiHome, FiSettings, FiUser, FiSearch, FiMenu, FiBell, FiCamera, FiVideo, FiMic, 
  FiMusic, FiImage, FiFolder, FiFile, FiPaperclip, FiLink, FiCloud, FiDatabase, FiServer, 
  FiMonitor, FiSmartphone, FiTablet, FiCpu, FiCode, FiWifi, FiBluetooth, FiLock, FiUnlock, 
  FiShield, FiKey, FiMap, FiMapPin, FiNavigation, FiCompass, FiTruck, FiBriefcase, FiCreditCard, 
  FiDollarSign, FiPercent, FiShoppingBag, FiShoppingCart, FiTag, FiGift, FiHeart, FiStar, FiAward, 
  FiSun, FiMoon, FiCloudRain, FiCloudSnow, FiCloudLightning, FiWind, FiActivity, FiThermometer, FiCheck,
  FiEdit, FiTrash, FiSave, FiDownload, FiUpload, FiShare, FiSend, FiInbox, FiMail, FiMessageCircle, FiPhone
} from 'react-icons/fi';

import { 
  FaReact, FaAngular, FaVuejs, FaNodeJs, FaPython, FaJava, FaPhp, FaHtml5, FaCss3Alt, FaSass, 
  FaGithub, FaGitlab, FaBitbucket, FaNpm, FaDocker, FaAws, FaWindows, FaApple, FaLinux, FaAndroid,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTwitch, FaDiscord, FaSlack, FaTrello,
  FaFigma, FaSketch, FaDribbble, FaBehance, FaSpotify, FaApplePay, FaGooglePay, FaPaypal, FaStripe,
  FaShopify, FaWordpress, FaMedium, FaReddit, FaWhatsapp, FaTelegram, FaSnapchat, FaTiktok
} from 'react-icons/fa';

import { 
  MdOutlineScience, MdOutlineBiotech, MdOutlineHealthAndSafety, MdOutlineLocalHospital, 
  MdOutlineMedicalServices, MdOutlineCoronavirus, MdOutlineMonitorHeart, MdOutlinePsychology, 
  MdOutlineAgriculture, MdOutlineForest, MdOutlinePark, MdOutlinePets, MdOutlineEco, 
  MdOutlineWaterDrop, MdOutlineRecycling, MdOutlineFlight, MdOutlineDirectionsCar, 
  MdOutlineDirectionsBus, MdOutlineDirectionsTransit, MdOutlineDirectionsRailway, 
  MdOutlineDirectionsBoat, MdOutlineLocalShipping, MdOutlineBusinessCenter, MdOutlineWork, 
  MdOutlineCorporateFare, MdOutlineMeetingRoom, MdOutlineAssignment, MdOutlineAssessment, 
  MdOutlineLeaderboard, MdOutlinePieChart, MdOutlineShowChart, MdOutlineAttachMoney
} from 'react-icons/md';

import type { IconType } from 'react-icons';

export interface IconDef {
  id: string;
  name: string;
  icon: IconType;
}

export interface IconCategory {
  id: string;
  name: string;
  icons: IconDef[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'ui',
    name: 'UI & Web Elements',
    icons: [
      { id: 'home', name: 'Home', icon: FiHome },
      { id: 'settings', name: 'Settings', icon: FiSettings },
      { id: 'user', name: 'User', icon: FiUser },
      { id: 'search', name: 'Search', icon: FiSearch },
      { id: 'menu', name: 'Menu', icon: FiMenu },
      { id: 'bell', name: 'Notifications', icon: FiBell },
      { id: 'check', name: 'Check', icon: FiCheck },
      { id: 'edit', name: 'Edit', icon: FiEdit },
      { id: 'trash', name: 'Delete', icon: FiTrash },
      { id: 'save', name: 'Save', icon: FiSave },
      { id: 'link', name: 'Link', icon: FiLink },
      { id: 'paperclip', name: 'Attachment', icon: FiPaperclip },
      { id: 'lock', name: 'Lock', icon: FiLock },
      { id: 'unlock', name: 'Unlock', icon: FiUnlock },
      { id: 'shield', name: 'Security', icon: FiShield },
      { id: 'key', name: 'Key', icon: FiKey },
      { id: 'download', name: 'Download', icon: FiDownload },
      { id: 'upload', name: 'Upload', icon: FiUpload },
      { id: 'share', name: 'Share', icon: FiShare },
      { id: 'folder', name: 'Folder', icon: FiFolder },
      { id: 'file', name: 'File', icon: FiFile },
    ]
  },
  {
    id: 'social',
    name: 'Social Media & Brands',
    icons: [
      { id: 'github', name: 'GitHub', icon: FaGithub },
      { id: 'gitlab', name: 'GitLab', icon: FaGitlab },
      { id: 'bitbucket', name: 'Bitbucket', icon: FaBitbucket },
      { id: 'discord', name: 'Discord', icon: FaDiscord },
      { id: 'slack', name: 'Slack', icon: FaSlack },
      { id: 'trello', name: 'Trello', icon: FaTrello },
      { id: 'figma', name: 'Figma', icon: FaFigma },
      { id: 'sketch', name: 'Sketch', icon: FaSketch },
      { id: 'dribbble', name: 'Dribbble', icon: FaDribbble },
      { id: 'behance', name: 'Behance', icon: FaBehance },
      { id: 'twitter', name: 'Twitter', icon: FaTwitter },
      { id: 'facebook', name: 'Facebook', icon: FaFacebook },
      { id: 'instagram', name: 'Instagram', icon: FaInstagram },
      { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin },
      { id: 'youtube', name: 'YouTube', icon: FaYoutube },
      { id: 'twitch', name: 'Twitch', icon: FaTwitch },
      { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp },
      { id: 'telegram', name: 'Telegram', icon: FaTelegram },
      { id: 'snapchat', name: 'Snapchat', icon: FaSnapchat },
      { id: 'tiktok', name: 'TikTok', icon: FaTiktok },
      { id: 'spotify', name: 'Spotify', icon: FaSpotify },
      { id: 'wordpress', name: 'WordPress', icon: FaWordpress },
      { id: 'medium', name: 'Medium', icon: FaMedium },
      { id: 'reddit', name: 'Reddit', icon: FaReddit },
    ]
  },
  {
    id: 'tech',
    name: 'Technology & Development',
    icons: [
      { id: 'code', name: 'Code', icon: FiCode },
      { id: 'react', name: 'React', icon: FaReact },
      { id: 'angular', name: 'Angular', icon: FaAngular },
      { id: 'vue', name: 'Vue', icon: FaVuejs },
      { id: 'nodejs', name: 'Node.js', icon: FaNodeJs },
      { id: 'python', name: 'Python', icon: FaPython },
      { id: 'java', name: 'Java', icon: FaJava },
      { id: 'php', name: 'PHP', icon: FaPhp },
      { id: 'html5', name: 'HTML5', icon: FaHtml5 },
      { id: 'css3', name: 'CSS3', icon: FaCss3Alt },
      { id: 'sass', name: 'Sass', icon: FaSass },
      { id: 'npm', name: 'npm', icon: FaNpm },
      { id: 'docker', name: 'Docker', icon: FaDocker },
      { id: 'aws', name: 'AWS', icon: FaAws },
      { id: 'windows', name: 'Windows', icon: FaWindows },
      { id: 'apple', name: 'Apple', icon: FaApple },
      { id: 'linux', name: 'Linux', icon: FaLinux },
      { id: 'android', name: 'Android', icon: FaAndroid },
      { id: 'cpu', name: 'CPU', icon: FiCpu },
      { id: 'server', name: 'Server', icon: FiServer },
      { id: 'database', name: 'Database', icon: FiDatabase },
      { id: 'cloud', name: 'Cloud', icon: FiCloud },
      { id: 'monitor', name: 'Monitor', icon: FiMonitor },
      { id: 'smartphone', name: 'Smartphone', icon: FiSmartphone },
      { id: 'tablet', name: 'Tablet', icon: FiTablet },
      { id: 'wifi', name: 'WiFi', icon: FiWifi },
      { id: 'bluetooth', name: 'Bluetooth', icon: FiBluetooth },
    ]
  },
  {
    id: 'commerce',
    name: 'Commerce & Finance',
    icons: [
      { id: 'credit-card', name: 'Credit Card', icon: FiCreditCard },
      { id: 'dollar', name: 'Dollar', icon: FiDollarSign },
      { id: 'money', name: 'Money', icon: MdOutlineAttachMoney },
      { id: 'percent', name: 'Discount', icon: FiPercent },
      { id: 'shopping-bag', name: 'Shopping Bag', icon: FiShoppingBag },
      { id: 'shopping-cart', name: 'Shopping Cart', icon: FiShoppingCart },
      { id: 'tag', name: 'Tag', icon: FiTag },
      { id: 'gift', name: 'Gift', icon: FiGift },
      { id: 'paypal', name: 'PayPal', icon: FaPaypal },
      { id: 'stripe', name: 'Stripe', icon: FaStripe },
      { id: 'apple-pay', name: 'Apple Pay', icon: FaApplePay },
      { id: 'google-pay', name: 'Google Pay', icon: FaGooglePay },
      { id: 'shopify', name: 'Shopify', icon: FaShopify },
    ]
  },
  {
    id: 'multimedia',
    name: 'Multimedia & Content',
    icons: [
      { id: 'camera', name: 'Camera', icon: FiCamera },
      { id: 'video', name: 'Video', icon: FiVideo },
      { id: 'mic', name: 'Microphone', icon: FiMic },
      { id: 'music', name: 'Music', icon: FiMusic },
      { id: 'image', name: 'Image', icon: FiImage },
      { id: 'play', name: 'Play', icon: FiActivity },
      { id: 'heart', name: 'Heart', icon: FiHeart },
      { id: 'star', name: 'Star', icon: FiStar },
      { id: 'award', name: 'Award', icon: FiAward },
      { id: 'send', name: 'Send', icon: FiSend },
      { id: 'inbox', name: 'Inbox', icon: FiInbox },
      { id: 'mail', name: 'Mail', icon: FiMail },
      { id: 'message', name: 'Message', icon: FiMessageCircle },
      { id: 'phone', name: 'Phone', icon: FiPhone },
    ]
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icons: [
      { id: 'science', name: 'Science', icon: MdOutlineScience },
      { id: 'biotech', name: 'Biotech', icon: MdOutlineBiotech },
      { id: 'health-safety', name: 'Health & Safety', icon: MdOutlineHealthAndSafety },
      { id: 'hospital', name: 'Hospital', icon: MdOutlineLocalHospital },
      { id: 'medical', name: 'Medical Services', icon: MdOutlineMedicalServices },
      { id: 'virus', name: 'Virus', icon: MdOutlineCoronavirus },
      { id: 'heart-monitor', name: 'Heart Monitor', icon: MdOutlineMonitorHeart },
      { id: 'psychology', name: 'Psychology', icon: MdOutlinePsychology },
      { id: 'thermometer', name: 'Thermometer', icon: FiThermometer },
      { id: 'activity', name: 'Activity', icon: FiActivity },
    ]
  },
  {
    id: 'nature',
    name: 'Nature & Environment',
    icons: [
      { id: 'agriculture', name: 'Agriculture', icon: MdOutlineAgriculture },
      { id: 'forest', name: 'Forest', icon: MdOutlineForest },
      { id: 'park', name: 'Park', icon: MdOutlinePark },
      { id: 'pets', name: 'Pets', icon: MdOutlinePets },
      { id: 'eco', name: 'Eco/Leaf', icon: MdOutlineEco },
      { id: 'water', name: 'Water Drop', icon: MdOutlineWaterDrop },
      { id: 'recycling', name: 'Recycling', icon: MdOutlineRecycling },
      { id: 'sun', name: 'Sun', icon: FiSun },
      { id: 'moon', name: 'Moon', icon: FiMoon },
      { id: 'rain', name: 'Rain', icon: FiCloudRain },
      { id: 'snow', name: 'Snow', icon: FiCloudSnow },
      { id: 'lightning', name: 'Lightning', icon: FiCloudLightning },
      { id: 'wind', name: 'Wind', icon: FiWind },
    ]
  },
  {
    id: 'transport',
    name: 'Transport & Logistics',
    icons: [
      { id: 'flight', name: 'Flight', icon: MdOutlineFlight },
      { id: 'car', name: 'Car', icon: MdOutlineDirectionsCar },
      { id: 'bus', name: 'Bus', icon: MdOutlineDirectionsBus },
      { id: 'transit', name: 'Transit', icon: MdOutlineDirectionsTransit },
      { id: 'railway', name: 'Railway', icon: MdOutlineDirectionsRailway },
      { id: 'boat', name: 'Boat', icon: MdOutlineDirectionsBoat },
      { id: 'shipping', name: 'Shipping', icon: MdOutlineLocalShipping },
      { id: 'truck', name: 'Truck', icon: FiTruck },
      { id: 'map', name: 'Map', icon: FiMap },
      { id: 'map-pin', name: 'Map Pin', icon: FiMapPin },
      { id: 'navigation', name: 'Navigation', icon: FiNavigation },
      { id: 'compass', name: 'Compass', icon: FiCompass },
    ]
  },
  {
    id: 'business',
    name: 'Business & Work',
    icons: [
      { id: 'briefcase', name: 'Briefcase', icon: FiBriefcase },
      { id: 'business-center', name: 'Business Center', icon: MdOutlineBusinessCenter },
      { id: 'work', name: 'Work', icon: MdOutlineWork },
      { id: 'corporate', name: 'Corporate', icon: MdOutlineCorporateFare },
      { id: 'meeting-room', name: 'Meeting Room', icon: MdOutlineMeetingRoom },
      { id: 'assignment', name: 'Assignment', icon: MdOutlineAssignment },
      { id: 'assessment', name: 'Assessment', icon: MdOutlineAssessment },
      { id: 'leaderboard', name: 'Leaderboard', icon: MdOutlineLeaderboard },
      { id: 'pie-chart', name: 'Pie Chart', icon: MdOutlinePieChart },
      { id: 'show-chart', name: 'Show Chart', icon: MdOutlineShowChart },
    ]
  }
];

export const getAllIcons = () => {
  const all: IconDef[] = [];
  ICON_CATEGORIES.forEach(cat => {
    cat.icons.forEach(icon => {
      if (!all.find(i => i.id === icon.id)) {
        all.push(icon);
      }
    });
  });
  return all;
};

export const getIconById = (id: string): IconType | null => {
  const allIcons = getAllIcons();
  const icon = allIcons.find(i => i.id === id);
  return icon ? icon.icon : null;
};
