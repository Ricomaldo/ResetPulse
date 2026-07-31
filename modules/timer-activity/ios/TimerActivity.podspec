Pod::Spec.new do |s|
  s.name           = 'TimerActivity'
  s.version        = '1.0.0'
  s.summary        = 'Pont Live Activity ResetPulse (mission 3d)'
  s.description    = 'Pont natif ActivityKit — start/end/isSupported pour l anneau de seance.'
  s.author         = 'IrimWebForge'
  s.homepage       = 'https://resetpulse.app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
