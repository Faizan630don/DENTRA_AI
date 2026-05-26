/**
 * toothKnowledge.js
 * 
 * Provides detailed anatomical and functional information for every tooth 
 * in the Universal Numbering System (1-32).
 */

export const TOOTH_KNOWLEDGE = {
  // Upper Right (1-8)
  '1':  { id: '1',  name: 'Upper Right Third Molar', quadrant: 'Upper Right', function: 'Grinding/Wisdom', anatomy: 'Wisdom tooth, often has variable root anatomy.' },
  '2':  { id: '2',  name: 'Upper Right Second Molar', quadrant: 'Upper Right', function: 'Heavy chewing', anatomy: 'Large surface area with four distinct cusps.' },
  '3':  { id: '3',  name: 'Upper Right First Molar', quadrant: 'Upper Right', function: 'Key of occlusion', anatomy: 'Largest tooth in the upper arch, 3 roots.' },
  '4':  { id: '4',  name: 'Upper Right Second Premolar', quadrant: 'Upper Right', function: 'Crushing food', anatomy: 'Bicuspid with two roughly equal sized cusps.' },
  '5':  { id: '5',  name: 'Upper Right First Premolar', quadrant: 'Upper Right', function: 'Tearing and crushing', anatomy: 'Unique bicuspid with two distinct roots.' },
  '6':  { id: '6',  name: 'Upper Right Canine (Eye Tooth)', quadrant: 'Upper Right', function: 'Tearing food', anatomy: 'Longest root in the mouth, cornerstone of the arch.' },
  '7':  { id: '7',  name: 'Upper Right Lateral Incisor', quadrant: 'Upper Right', function: 'Cutting food', anatomy: 'Narrower than central incisor, shovel-shaped.' },
  '8':  { id: '8',  name: 'Upper Right Central Incisor', quadrant: 'Upper Right', function: 'Primary biting', anatomy: 'Widest tooth in the front of the mouth.' },

  // Upper Left (9-16)
  '9':  { id: '9',  name: 'Upper Left Central Incisor', quadrant: 'Upper Left', function: 'Primary biting', anatomy: 'Aesthetic centerpiece of the smile.' },
  '10': { id: '10', name: 'Upper Left Lateral Incisor', quadrant: 'Upper Left', function: 'Cutting food', anatomy: 'Slightly smaller than the central incisor.' },
  '11': { id: '11', name: 'Upper Left Canine', quadrant: 'Upper Left', function: 'Tearing food', anatomy: 'Strong, pointed cusp for gripping.' },
  '12': { id: '12', name: 'Upper Left First Premolar', quadrant: 'Upper Left', function: 'Tearing and crushing', anatomy: 'Bifurcated root system common.' },
  '13': { id: '13', name: 'Upper Left Second Premolar', quadrant: 'Upper Left', function: 'Crushing food', anatomy: 'Two cusps of nearly equal height.' },
  '14': { id: '14', name: 'Upper Left First Molar', quadrant: 'Upper Left', function: 'Grinding food', anatomy: 'Six-year molar, massive chewing surface.' },
  '15': { id: '15', name: 'Upper Left Second Molar', quadrant: 'Upper Left', function: 'Heavy grinding', anatomy: 'Twelve-year molar, triple root system.' },
  '16': { id: '16', name: 'Upper Left Third Molar', quadrant: 'Upper Left', function: 'Wisdom tooth', anatomy: 'Frequently impacted against the second molar.' },

  // Lower Left (17-24)
  '17': { id: '17', name: 'Lower Left Third Molar', quadrant: 'Lower Left', function: 'Wisdom tooth', anatomy: 'Most common site for mandibular impaction.' },
  '18': { id: '18', name: 'Lower Left Second Molar', quadrant: 'Lower Left', function: 'Grinding', anatomy: 'Two large roots (mesial and distal).' },
  '19': { id: '19', name: 'Lower Left First Molar', quadrant: 'Lower Left', function: 'Primary grinding', anatomy: 'Usually the first permanent tooth to erupt.' },
  '20': { id: '20', name: 'Lower Left Second Premolar', quadrant: 'Lower Left', function: 'Crushing', anatomy: 'Can have two or three cusps (Y, U, H pattern).' },
  '21': { id: '21', name: 'Lower Left First Premolar', quadrant: 'Lower Left', function: 'Tearing and crushing', anatomy: 'Distinctive large buccal cusp and very small lingual cusp.' },
  '22': { id: '22', name: 'Lower Left Canine', quadrant: 'Lower Left', function: 'Tearing', anatomy: 'Single cusp, strong and resistant to wear.' },
  '23': { id: '23', name: 'Lower Left Lateral Incisor', quadrant: 'Lower Left', function: 'Biting', anatomy: 'Slightly wider than lower central incisor.' },
  '24': { id: '24', name: 'Lower Left Central Incisor', quadrant: 'Lower Left', function: 'Biting/Shearing', anatomy: 'Smallest and narrowest permanent tooth.' },

  // Lower Right (25-32)
  '25': { id: '25', name: 'Lower Right Central Incisor', quadrant: 'Lower Right', function: 'Biting', anatomy: 'Symmetrical and thin.' },
  '26': { id: '26', name: 'Lower Right Lateral Incisor', quadrant: 'Lower Right', function: 'Biting', anatomy: 'Assists in shearing food.' },
  '27': { id: '27', name: 'Lower Right Canine', quadrant: 'Lower Right', function: 'Tearing', anatomy: 'Anchors the corner of the lower arch.' },
  '28': { id: '28', name: 'Lower Right First Premolar', quadrant: 'Lower Right', function: 'Tearing/Crushing', anatomy: 'Single rooted with a prominent buccal cusp.' },
  '29': { id: '29', name: 'Lower Right Second Premolar', quadrant: 'Lower Right', function: 'Crushing', anatomy: 'Wider chewing surface than the first premolar.' },
  '30': { id: '30', name: 'Lower Right First Molar', quadrant: 'Lower Right', function: 'Major grinding', anatomy: 'Five cusps and two massive roots.' },
  '31': { id: '31', name: 'Lower Right Second Molar', quadrant: 'Lower Right', function: 'Grinding', anatomy: 'Rectangular chewing surface.' },
  '32': { id: '32', name: 'Lower Right Third Molar', quadrant: 'Lower Right', function: 'Wisdom tooth', anatomy: 'Often requires surgical extraction.' },
};

export function getToothInfo(id) {
  // Handle "T-21" or "21"
  const cleanId = id.replace(/[^0-9]/g, '');
  return TOOTH_KNOWLEDGE[cleanId] || null;
}
