module.exports = async (req, res) => {
  const samples = [
    {
      id: 'sample_1',
      name: 'Impactor-2025 (Hypothetical)',
      diameter: 300,
      velocity: 20,
      density: 3000,
      approach_angle: 45,
      description: 'A hypothetical 300m asteroid approaching at 20 km/s',
    },
    {
      id: 'sample_2',
      name: 'City Killer (Hypothetical)',
      diameter: 150,
      velocity: 25,
      density: 2500,
      approach_angle: 30,
      description: 'A smaller but faster asteroid capable of destroying a city',
    },
    {
      id: 'sample_3',
      name: 'Tunguska-Class',
      diameter: 60,
      velocity: 15,
      density: 2000,
      approach_angle: 20,
      description: 'Similar to the 1908 Tunguska event asteroid',
    },
    {
      id: 'sample_4',
      name: 'Chelyabinsk-Class',
      diameter: 20,
      velocity: 19,
      density: 1800,
      approach_angle: 18,
      description: 'Similar to the 2013 Chelyabinsk meteor',
    },
    {
      id: 'sample_5',
      name: 'Extinction Event',
      diameter: 10000,
      velocity: 30,
      density: 3500,
      approach_angle: 60,
      description: 'A 10km asteroid - similar to the dinosaur extinction event',
    },
  ];
  res.status(200).json({ samples });
};
