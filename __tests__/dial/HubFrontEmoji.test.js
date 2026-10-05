import React from 'react';
import { create, act } from 'react-test-renderer';
import HubFrontEmoji from '../../src/components/dial/dial/HubFrontEmoji';
import { ENOW_HUB_GHOST_OPACITY } from '../../src/config/enow-sketch';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const make = (name) => {
    const C = ({ children, ...props }) => React.createElement(name, props, children);
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    default: make('Svg'),
    Svg: make('Svg'),
    Text: make('SvgText'),
    Defs: make('Defs'),
    ClipPath: make('ClipPath'),
    Path: make('Path'),
  };
});

const render = (el) => {
  let r;
  act(() => {
    r = create(el);
  });
  return r;
};
const texts = (tree) => tree.root.findAllByType('SvgText');
const paths = (tree) => tree.root.findAllByType('Path');

describe('HubFrontEmoji', () => {
  it('à 0 : fantôme seul, aucun clip', () => {
    const tree = render(<HubFrontEmoji emoji="💼" size={100} frontProgress={0} />);
    const t = texts(tree);
    expect(t).toHaveLength(1);
    expect(t[0].props.opacity).toBe(ENOW_HUB_GHOST_OPACITY);
    expect(paths(tree)).toHaveLength(0);
  });

  it('à 0.5 : fantôme + couche pleine sous un clip en secteur', () => {
    const tree = render(<HubFrontEmoji emoji="💼" size={100} frontProgress={0.5} />);
    const t = texts(tree);
    expect(t).toHaveLength(2);
    expect(t[1].props.clipPath).toMatch(/^url\(#hubFront\w+\)$/);
    const d = paths(tree)[0].props.d;
    expect(d).toContain('A 100 100 0 0 0'); // angle 180°, sens anti-horaire
    expect(d).toContain('M 50 50');
  });

  it('respecte le sens horaire', () => {
    const tree = render(<HubFrontEmoji emoji="💼" size={100} clockwise frontProgress={0.5} />);
    expect(paths(tree)[0].props.d).toContain('A 100 100 0 0 1');
  });

  it('à 1 : couche pleine entière, sans clip', () => {
    const tree = render(<HubFrontEmoji emoji="💼" size={100} frontProgress={1} />);
    const t = texts(tree);
    expect(t).toHaveLength(2);
    expect(t[1].props.clipPath).toBeUndefined();
    expect(paths(tree)).toHaveLength(0);
  });
});
