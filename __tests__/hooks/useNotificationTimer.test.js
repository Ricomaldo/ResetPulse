// Tests du foreground handler des notifications — règle ADR-018 §① (un
// instant = un canal). `buildNotificationBehavior` est la fonction pure que
// le handler (Notifications.setNotificationHandler, module-level) évalue à
// chaque présentation avec l'AppState de l'instant.
import { buildNotificationBehavior } from '../../src/hooks/useNotificationTimer';

describe('buildNotificationBehavior (ADR-018 §① — un instant = un canal)', () => {
  it('app au premier plan (active) → la notification se tait entièrement (l\'app porte déjà son + bloom + haptique)', () => {
    expect(buildNotificationBehavior('active')).toEqual({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  it('app en fond (background) → la notification est le canal : bannière + liste + son', () => {
    expect(buildNotificationBehavior('background')).toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });

  it('app inactive (transition, app switcher) → traitée comme le fond : la notification parle', () => {
    expect(buildNotificationBehavior('inactive')).toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });

  it('jamais de badge d\'icône, quel que soit l\'état (ADR-018 §① — aucun badge)', () => {
    ['active', 'background', 'inactive'].forEach((state) => {
      expect(buildNotificationBehavior(state).shouldSetBadge).toBe(false);
    });
  });
});
