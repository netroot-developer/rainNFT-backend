function generateClubLevels(level1, level2, level3) {
  return {
    1: { team: 2, payoutPerMember: level1 },
    2: { team: 4, payoutPerMember: level2 },
    3: { team: 8, payoutPerMember: level3 },
  };
}

export default {
  clubs: {
    1: { levels: generateClubLevels(20, 80, 1920), upgrade: { mode: 'fourXPrev', baseLevel: 1 } },
    2: { levels: generateClubLevels(100, 400, 9600), upgrade: { mode: 'fourXPrev', baseLevel: 1 } },
    3: { levels: generateClubLevels(400, 1600, 38400), upgrade: { mode: 'fourXPrev', baseLevel: 1 } },
    4: { levels: generateClubLevels(1600, 6400, 153600), upgrade: { mode: 'fourXPrev', baseLevel: 1 } },
    5: { levels: generateClubLevels(3200, 12800, 51200), upgrade: { mode: 'fourXPrev', baseLevel: 1 } },
    6: { levels: generateClubLevels(12800, 51200, 204800), upgrade: { mode: 'explicit', amount: 0 } },
  },
  maxClub: 6
};
