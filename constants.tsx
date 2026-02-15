
import { CategoryId, Category, LearningItem } from './types';

// Helper to generate Numbers 1-100
const generateNumbers = (): LearningItem[] => {
  const nums: LearningItem[] = [];
  for (let i = 1; i <= 100; i++) {
    nums.push({
      id: `num-${i}`,
      name: i.toString(),
      image: i.toString(),
      color: '#4FC3F7'
    });
  }
  return nums;
};

// Helper to fill category if short (optional for these specific categories)
const fillTo50 = (items: LearningItem[], baseId: string, baseName: string, emoji: string): LearningItem[] => {
  const result = [...items];
  const colors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F1F8E9', '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC'];
  const emojis = ['🌟', '✨', '🎈', '🎨', '🧸', '🍭', '🌈', '🍦', '🌞'];
  while (result.length < 50) {
    const i = result.length + 1;
    result.push({
      id: `${baseId}-${i}`,
      name: `${baseName} ${i}`,
      image: emoji || emojis[i % emojis.length],
      color: colors[i % colors.length]
    });
  }
  return result;
};

export const CATEGORIES: Category[] = [
  {
    id: CategoryId.ALPHABET,
    name: 'Alphabet',
    icon: '🔤',
    color: 'bg-red-400',
    items: fillTo50([
      { id: 'a', name: 'Apple', image: '🍎', color: '#FF5252' },
      { id: 'b', name: 'Ball', image: '⚽', color: '#448AFF' },
      { id: 'c', name: 'Cat', image: '🐱', color: '#FFD740' },
      { id: 'd', name: 'Dog', image: '🐶', color: '#8D6E63' },
      { id: 'e', name: 'Elephant', image: '🐘', color: '#90A4AE' }
    ], 'alphabet', 'Object', '✨')
  },
  {
    id: CategoryId.NUMBERS,
    name: 'Numbers 1-100',
    icon: '🔢',
    color: 'bg-blue-500',
    items: generateNumbers()
  },
  {
    id: CategoryId.FLOWERS,
    name: 'Flowers (Phool)',
    icon: '🌸',
    color: 'bg-pink-300',
    items: [
      { id: 'rose', name: 'Rose (Gulaab)', image: '🌹', color: '#F44336' },
      { id: 'sunflower', name: 'Sunflower (Surajmukhi)', image: '🌻', color: '#FFEB3B' },
      { id: 'lotus', name: 'Lotus (Kamal)', image: '🪷', color: '#F8BBD0' },
      { id: 'lily', name: 'Lily (Kumudini)', image: '🪻', color: '#E1BEE7' },
      { id: 'tulip', name: 'Tulip', image: '🌷', color: '#F06292' },
      { id: 'daisy', name: 'Daisy', image: '🌼', color: '#FFF9C4' },
      { id: 'hibiscus', name: 'Hibiscus (Gudhal)', image: '🌺', color: '#E91E63' },
      { id: 'jasmine', name: 'Jasmine (Chameli)', image: '✨', color: '#FFFFFF' },
      { id: 'marigold', name: 'Marigold (Genda)', image: '🏵️', color: '#FF9800' },
      { id: 'orchid', name: 'Orchid', image: '💐', color: '#BA68C8' },
      { id: 'lavender', name: 'Lavender', image: '🌿', color: '#9575CD' },
      { id: 'dahlia', name: 'Dahlia', image: '💮', color: '#D81B60' }
    ]
  },
  {
    id: CategoryId.BIRDS,
    name: 'Birds (Pakshi)',
    icon: '🐦',
    color: 'bg-sky-400',
    items: [
      { id: 'parrot', name: 'Parrot (Tota)', image: '🦜', color: '#4CAF50', soundPhonetic: "Mithu Mithu" },
      { id: 'peacock', name: 'Peacock (Mor)', image: '🦚', color: '#009688', soundPhonetic: "Piyu Piyu" },
      { id: 'owl', name: 'Owl ( उल्लू)', image: '🦉', color: '#795548', soundPhonetic: "Hoot hoot" },
      { id: 'eagle', name: 'Eagle (Baaz)', image: '🦅', color: '#A1887F', soundPhonetic: "Screee" },
      { id: 'sparrow', name: 'Sparrow (Chidiya)', image: '🐦', color: '#BDBDBD', soundPhonetic: "Cheep cheep" },
      { id: 'pigeon', name: 'Pigeon (Kabutar)', image: '🕊️', color: '#90A4AE', soundPhonetic: "Gutur gu" },
      { id: 'duck', name: 'Duck (Battakh)', image: '🦆', color: '#FFEB3B', soundPhonetic: "Quack quack" },
      { id: 'crow', name: 'Crow (Kauwa)', image: '🐦‍⬛', color: '#424242', soundPhonetic: "Caw caw" },
      { id: 'penguin', name: 'Penguin', image: '🐧', color: '#E0E0E0', soundPhonetic: "Honk honk" },
      { id: 'swan', name: 'Swan (Hans)', image: '🦢', color: '#FFFFFF', soundPhonetic: "Screech" }
    ]
  },
  {
    id: CategoryId.INSECTS,
    name: 'Insects (Keede)',
    icon: '🐜',
    color: 'bg-lime-400',
    items: [
      { id: 'butterfly', name: 'Butterfly (Titli)', image: '🦋', color: '#F06292' },
      { id: 'bee', name: 'Honey Bee (Madhumakhi)', image: '🐝', color: '#FFEB3B', soundPhonetic: "Bzzzzzz" },
      { id: 'ant', name: 'Ant (Chinti)', image: '🐜', color: '#795548' },
      { id: 'ladybug', name: 'Ladybug', image: '🐞', color: '#F44336' },
      { id: 'spider', name: 'Spider ( मकड़ी)', image: '🕷️', color: '#424242' },
      { id: 'mosquito', name: 'Mosquito (Machhar)', image: '🦟', color: '#9E9E9E', soundPhonetic: "Eeeeeee" },
      { id: 'grasshopper', name: 'Grasshopper', image: '🦗', color: '#8BC34A' },
      { id: 'dragonfly', name: 'Dragonfly', image: '🧚', color: '#00BCD4' }
    ]
  },
  {
    id: CategoryId.DAYS,
    name: 'Days (Din)',
    icon: '📅',
    color: 'bg-yellow-400',
    items: [
      { id: 'mon', name: 'Monday', image: '🌙', color: '#FFCDD2' },
      { id: 'tue', name: 'Tuesday', image: '🔥', color: '#F8BBD0' },
      { id: 'wed', name: 'Wednesday', image: '🧠', color: '#E1BEE7' },
      { id: 'thu', name: 'Thursday', image: '⚡', color: '#D1C4E9' },
      { id: 'fri', name: 'Friday', image: '💖', color: '#C5CAE9' },
      { id: 'sat', name: 'Saturday', image: '🪐', color: '#BBDEFB' },
      { id: 'sun', name: 'Sunday', image: '☀️', color: '#FFF59D' }
    ]
  },
  {
    id: CategoryId.MONTHS,
    name: 'Months (Mahine)',
    icon: '📆',
    color: 'bg-indigo-400',
    items: [
      { id: 'jan', name: 'January', image: '❄️', color: '#E3F2FD' },
      { id: 'feb', name: 'February', image: '💖', color: '#FCE4EC' },
      { id: 'mar', name: 'March', image: '🍀', color: '#E8F5E9' },
      { id: 'apr', name: 'April', image: '☔', color: '#F3E5F5' },
      { id: 'may', name: 'May', image: '🌸', color: '#FFF3E0' },
      { id: 'jun', name: 'June', image: '☀️', color: '#FFFDE7' },
      { id: 'jul', name: 'July', image: '🍦', color: '#E1F5FE' },
      { id: 'aug', name: 'August', image: '⛱️', color: '#E0F2F1' },
      { id: 'sep', name: 'September', image: '🍎', color: '#FFEBEE' },
      { id: 'oct', name: 'October', image: '🎃', color: '#FFF3E0' },
      { id: 'nov', name: 'November', image: '🍂', color: '#EFEBE9' },
      { id: 'dec', name: 'December', image: '🎄', color: '#E8F5E9' }
    ]
  },
  {
    id: CategoryId.RHYMES,
    name: 'Rhymes (Kavita)',
    icon: '🎶',
    color: 'bg-purple-500',
    items: [
      { 
        id: 'twinkle', 
        name: 'Twinkle Twinkle', 
        image: '✨', 
        color: '#1A237E', 
        audioText: "Twinkle twinkle little star, How I wonder what you are! Up above the world so high, Like a diamond in the sky!" 
      },
      { 
        id: 'bus', 
        name: 'Wheels on the Bus', 
        image: '🚌', 
        color: '#FDD835', 
        audioText: "The wheels on the bus go round and round, Round and round, round and round. The wheels on the bus go round and round, All through the town!" 
      },
      { 
        id: 'johny', 
        name: 'Johny Johny', 
        image: '👶', 
        color: '#FFCCBC', 
        audioText: "Johny Johny, Yes Papa? Eating sugar? No Papa! Telling lies? No Papa! Open your mouth, Ha! Ha! Ha!" 
      },
      { 
        id: 'rain', 
        name: 'Rain Rain', 
        image: '☔', 
        color: '#4FC3F7', 
        audioText: "Rain, rain, go away, Come again another day, Little Johnny wants to play. Rain, rain, go away!" 
      },
      { 
        id: 'baa', 
        name: 'Baa Baa Black Sheep', 
        image: '🐑', 
        color: '#424242', 
        audioText: "Baa, baa, black sheep, Have you any wool? Yes sir, yes sir, Three bags full!" 
      }
    ]
  },
  {
    id: CategoryId.FARM_ANIMALS,
    name: 'Farm Animals',
    icon: '🚜',
    color: 'bg-yellow-500',
    items: [
      { id: 'cow', name: 'Cow', image: '🐮', color: '#FFFFFF', soundPhonetic: "Mooooo" },
      { id: 'pig', name: 'Pig', image: '🐷', color: '#F8BBD0', soundPhonetic: "Oink oink oink" },
      { id: 'sheep', name: 'Sheep', image: '🐑', color: '#F5F5F5', soundPhonetic: "Baaaaa baaaaa" }
    ]
  },
  {
    id: CategoryId.WILD_ANIMALS,
    name: 'Wild Animals',
    icon: '🦁',
    color: 'bg-orange-600',
    items: [
      { id: 'lion', name: 'Lion', image: '🦁', color: '#FFB300', soundPhonetic: "Roarrrrrr" },
      { id: 'tiger', name: 'Tiger', image: '🐯', color: '#FF7043', soundPhonetic: "Grrrrrrr roar" },
      { id: 'monkey', name: 'Monkey', image: '🐵', color: '#8D6E63', soundPhonetic: "Ooh ooh aah aah" }
    ]
  }
];

export const APP_CONFIG = {
  TITLE: 'KIDS LEARNING WORLD',
  MOTTO: 'Learning is Fun!',
  STORAGE_KEY: 'KIDS_LEARNING_WORLD_V1'
};
