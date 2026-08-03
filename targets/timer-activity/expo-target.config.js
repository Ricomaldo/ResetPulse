/** @type {import('@bacons/apple-targets/app.plugin').Config} */
// Extension Live Activity + WidgetKit (mission 3d) — le Swift de ce dossier
// vit HORS de ios/ et survit à `expo prebuild --clean` (@bacons/apple-targets).
// deploymentTarget 16.2 : ProgressView(timerInterval:) est cassé avant
// (bug Apple documenté, forum 722073).
module.exports = {
  type: 'widget',
  name: 'TimerActivity',
  deploymentTarget: '16.2',
  frameworks: ['SwiftUI', 'ActivityKit', 'WidgetKit'],
};
