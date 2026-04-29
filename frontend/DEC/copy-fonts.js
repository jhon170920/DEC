const fs = require('fs');
const path = require('path');

const src = 'node_modules/expo/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';
const dest = 'dist/assets/node_modules/expo/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';

// Hashes que Expo generó (los ves en el output del build)
const hashMap = {
  'Feather': 'ca4b48e04dc1ce10bfbddb262c8b835f',
  'MaterialCommunityIcons': '6e435534bd35da5fef04168860a9b8fa',
  'AntDesign': '3f78af31cca60105799838a1a7a59fbd',
  'Entypo': '31b5ffea3daddc69dd01a1f3d6cf63c5',
  'EvilIcons': '140c53a7643ea949007aa9a282153849',
  'FontAwesome': 'b06871f281fee6b241d60582ae9369b9',
  'FontAwesome5_Brands': '3b89dd103490708d19a95adcae52210e',
  'FontAwesome5_Regular': '1f77739ca9ff2188b539c36f30ffa2be',
  'FontAwesome5_Solid': '605ed7926cf39a2ad5ec2d1f9d391d3d',
  'FontAwesome6_Brands': '56c8d80832e37783f12c05db7c8849e2',
  'FontAwesome6_Regular': '370dd5af19f8364907b6e2c41f45dbbf',
  'FontAwesome6_Solid': 'adec7d6f310bc577f05e8fe06a5daccf',
  'Fontisto': 'b49ae8ab2dbccb02c4d11caaacf09eab',
  'Foundation': 'e20945d7c929279ef7a6f1db184a4470',
  'Ionicons': 'b4eb097d35f44ed943676fd56f6bdc51',
  'MaterialIcons': '4e85bc9ebe07e0340c9c4fc2f6c38908',
  'Octicons': '871378c6eab492a3e689a9385dc45a12',
  'SimpleLineIcons': 'd2285965fe34b05465047401b8595dd0',
  'Zocial': '1681f34aaca71b8dfb70756bca331eb2',
};

fs.mkdirSync(dest, { recursive: true });

Object.entries(hashMap).forEach(([name, hash]) => {
  const srcFile = path.join(src, `${name}.ttf`);
  const destFile = path.join(dest, `${name}.${hash}.ttf`);

  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✅ Copiado: ${name}.${hash}.ttf`);
  } else {
    console.warn(`⚠️  No encontrado: ${srcFile}`);
  }
});