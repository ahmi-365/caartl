export interface CarData {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  currentBid: number;
  sellerExpectation: number;
  bids: number;
  year: number;
  condition: 'New' | 'Used';
  mileage: number;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  type: 'live' | 'upcoming' | 'negotiation';
}

export const carsData: CarData[] = [
  {
    id: '1',
    title: 'Tesla Model 3',
    subtitle: 'Standard',
    imageUrl: 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png',
    currentBid: 24000,
    sellerExpectation: 25000,
    bids: 12,
    year: 2025,
    condition: 'Used',
    mileage: 20,
    countdown: {
      days: 2,
      hours: 11,
      minutes: 21,
      seconds: 20,
    },
    type: 'negotiation',
  },
  {
    id: '2',
    title: 'Audi Model',
    subtitle: 'x56',
    imageUrl: 'https://c.animaapp.com/mg9397aqkN2Sch/img/audi-1.png',
    currentBid: 34000,
    sellerExpectation: 45000,
    bids: 16,
    year: 2025,
    condition: 'Used',
    mileage: 20,
    countdown: {
      days: 3,
      hours: 1,
      minutes: 11,
      seconds: 9,
    },
    type: 'live',
  },
  {
    id: '3',
    title: 'BMW X5',
    subtitle: 'M Sport',
    imageUrl: 'https://c.animaapp.com/mg9397aqkN2Sch/img/audi-1.png',
    currentBid: 52000,
    sellerExpectation: 58000,
    bids: 8,
    year: 2024,
    condition: 'New',
    mileage: 5,
    countdown: {
      days: 1,
      hours: 5,
      minutes: 30,
      seconds: 15,
    },
    type: 'upcoming',
  },
  {
    id: '4',
    title: 'Mercedes-Benz',
    subtitle: 'C-Class',
    imageUrl: 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png',
    currentBid: 38000,
    sellerExpectation: 42000,
    bids: 20,
    year: 2025,
    condition: 'Used',
    mileage: 15,
    countdown: {
      days: 4,
      hours: 8,
      minutes: 45,
      seconds: 30,
    },
    type: 'live',
  },
  {
    id: '5',
    title: 'Honda Pilot',
    subtitle: '7-Passenger',
    imageUrl: 'https://c.animaapp.com/mg9397aqkN2Sch/img/audi-1.png',
    currentBid: 28000,
    sellerExpectation: 30000,
    bids: 14,
    year: 2023,
    condition: 'Used',
    mileage: 35,
    countdown: {
      days: 2,
      hours: 3,
      minutes: 15,
      seconds: 45,
    },
    type: 'negotiation',
  },
];