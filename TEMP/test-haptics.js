// Test simple pour vérifier que expo-haptics fonctionne
// À exécuter dans une console React Native ou Expo Go

import haptics from '../src/utils/haptics';

// Test des différents types d'haptiques
export const testHaptics = async () => {
  console.log('🧪 Testing Haptics...');
  
  try {
    console.log('✅ Selection haptic');
    await haptics.selection();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Impact Light haptic');
    await haptics.impact('light');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Impact Medium haptic');
    await haptics.impact('medium');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Impact Heavy haptic');
    await haptics.impact('heavy');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Success notification haptic');
    await haptics.success();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Warning notification haptic');
    await haptics.warning();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Error notification haptic');
    await haptics.error();
    
    console.log('🎉 All haptics tested successfully!');
  } catch (error) {
    console.error('❌ Error testing haptics:', error);
  }
};

// Pour tester dans la console :
// import { testHaptics } from './TEMP/test-haptics';
// testHaptics();
