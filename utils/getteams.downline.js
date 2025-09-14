const { default: mongoose } = require("mongoose");
const { UserModel } = require("../models/user.model");
const { PackageModel } = require("../models/package.model");

async function getTeamsDownline(userId, currentTeam = 1, maxTeams = 5) {
  const teams = [0, 0, 0, 0, 0];
  const result = { teamA: [], teamB: [], teamC: [] };
  if (currentTeam > maxTeams) return result;
  const partners = await UserModel.find({ sponsor: userId }, { _id: 1, username: 1, account: 1, investment: 1, active: 1, createdAt: 1 });
  const currentTeamResult = {
    level: currentTeam,
    required: teams[currentTeam - 1],
    partners: partners.filter(partner => (partner.active.isActive && partner.active.isVerified)).map(partner => ({
      _id: partner._id,
      username: partner.username,
      walletAddress: partner.account,
      investment: partner.investment,
      active: partner.active,
      isVerified: partner.active.isVerified,
      createdAt: partner.createdAt,
    })),
    completed: partners.filter(partner => (partner.active.isActive && partner.active.isVerified)).length >= teams[currentTeam - 1], // Check if requirement is met
  };

  if (currentTeam === 1) result.teamA = currentTeamResult.partners;
  if (currentTeam === 2) result.teamB = currentTeamResult.partners;
  if (currentTeam === 3) result.teamC = currentTeamResult.partners;

  for (const partner of partners) {
    const partnerDownline = await getTeamsDownline(partner._id, currentTeam + 1, maxTeams);
    result.teamA.push(...partnerDownline.teamA);
    result.teamB.push(...partnerDownline.teamB);
    result.teamC.push(...partnerDownline.teamC);
  }
  return result;
}

async function getAllTeamsDownline(userId, currentTeam = 1, maxTeams = 5) {
  const teams = [0, 0, 0, 0, 0];
  const result = { teamA: [], teamB: [], teamC: [], teamD: [], teamE: [] };
  if (currentTeam > maxTeams) return result;
  const partners = await UserModel.find({ sponsor: userId }, { _id: 1, username: 1, account: 1, investment: 1, active: 1, createdAt: 1, income: 1, partners: 1 }).populate({ path: "account", select: "-_id walletAddress" });
  const currentTeamResult = {
    level: currentTeam,
    required: teams[currentTeam - 1],
    partners: partners.filter(partner => (partner.active.isVerified)).map(partner => ({
      _id: partner._id,
      username: partner.username,
      walletAddress: partner.account,
      investment: partner.investment,
      income: partner.income,
      active: partner.active,
      isVerified: partner.active.isVerified,
      partnerLength: partner.partners.length,
      createdAt: partner.createdAt,
    })),
    completed: partners.filter(partner => (partner.active.isVerified)).length >= teams[currentTeam - 1], // Check if requirement is met
  };

  if (currentTeam === 1) result.teamA = currentTeamResult.partners;
  if (currentTeam === 2) result.teamB = currentTeamResult.partners;
  if (currentTeam === 3) result.teamC = currentTeamResult.partners;
  if (currentTeam === 4) result.teamD = currentTeamResult.partners;
  if (currentTeam === 5) result.teamE = currentTeamResult.partners;

  for (const partner of partners) {
    const partnerDownline = await getAllTeamsDownline(partner._id, currentTeam + 1, maxTeams);
    result.teamA.push(...partnerDownline.teamA);
    result.teamB.push(...partnerDownline.teamB);
    result.teamC.push(...partnerDownline.teamC);
    result.teamD.push(...partnerDownline.teamD);
    result.teamE.push(...partnerDownline.teamE);
  }
  return result;
}


/**
 * Create a downline tree based on user partners.
 * @param {String} userId - ID of the root user.
 * @param {Number} depth - Maximum depth for the downline tree.
 * @returns {Object} - Tree structure representing the downline.
 */
const getDownlineTree = async (userId, depth = Infinity) => {
  try {
    let totalLength = 0;

    const buildTree = async (userId, currentDepth) => {
      if (currentDepth > depth) return null;
      const user = await UserModel.findById(userId, { _id: 1, id: 1, username: 1, account: 1, active: 1, investment: 1, referralLink: 1, partners: 1, createdAt: 1, income: 1 })
        .populate({
          path: "partners",
          match: { 'active.isVerified': true, 'active.isBlocked': false }, // Filter active and verified users
          select: "_id id username account active investment referralLink partners createdAt income", // Fetch only necessary fields
        }).populate({ path: "account", select: '-_id walletAddress' })
        .lean();
      if (!user) {
        return null;
      }

      totalLength++; // Increment the total length for each user node

      const userNode = {
        id: user.id,
        username: user.username,
        referralLink: user.referralLink,
        walletAddress: user.account,
        investment: user.investment,
        income: user.income,
        active: user.active,
        partnersLength: user.partners.length,
        createdAt: user.createdAt,
        partners: [],
      };

      if (user.partners && user.partners.length > 0) {
        const partnerTrees = await Promise.all(
          user.partners.map(partner => buildTree(partner._id, currentDepth + 1))
        );
        userNode.partners = partnerTrees.filter(Boolean); // Filter out null values
      }
      return userNode;
    };
    const tree = await buildTree(userId, 0);
    return { tree, totalLength };
  } catch (error) {
    console.error("Error creating downline tree:", error.message);
    throw error;
  }
};


const groupLevels = {
  group1: { levels: [1, 2, 3], teams: ["teamA", "teamB", "teamC"] },
  group2: { levels: [4, 5, 6], teams: ["teamD", "teamE", "teamF"] },
  group3: { levels: [7, 8, 9], teams: ["teamG", "teamH", "teamI"] }
};

async function getGroupDownline({ userId, groupName = "all", currentLevel = 1, teamName = null }) {
  const label = `Level ${currentLevel} - ${userId}`;
  // console.time(label);

  const selectedGroups = groupName === "all" ? Object.keys(groupLevels) : [groupName];
  const selectedLevels = selectedGroups.flatMap(g => groupLevels[g].levels);
  const maxLevel = Math.max(...selectedLevels);

  const result = {};
  for (const group of selectedGroups) {
    result[group] = {};
    const teamsToAdd = groupLevels[group].teams;
    teamsToAdd.forEach((team, index) => {
      if (!teamName || teamName === index + 1) {
        result[group][team] = [];
      }
    });
  }

  if (currentLevel > maxLevel) {
    // console.timeEnd(label);
    return result;
  }

  const partners = await UserModel.find(
    { sponsor: userId },
    {
      _id: 1,
      username: 1,
      account: 1,
      investment: 1,
      active: 1,
      createdAt: 1
    }
  );

  const teamLetter = (level) => {
    const teamIndex = (level - 1) % 3;
    return ["A", "B", "C"][teamIndex] || level;
  };
  // Helper to convert groupName to A, B, or C
  const groupLetter = (groupName) => {
    const groupMap = {
      group1: "A",
      group2: "B",
      group3: "C"
    };
    return groupMap[groupName] || "ALL";
  };

  const validPartners = partners
    .filter(p => p.active.isVerified)
    .map(p => ({
      _id: p._id,
      username: p.username,
      walletAddress: p.account,
      investment: p.investment,
      active: p.active,
      isVerified: p.active.isVerified,
      createdAt: p.createdAt,
      teamName: currentLevel || teamLetter(currentLevel),
      groupName: groupLetter(groupName) == "ALL" ? currentLevel <= 3 ? 'A' : currentLevel <= 6 ? "B" : 'C' : groupLetter(groupName)
    }));

  for (const group of selectedGroups) {
    const { levels, teams } = groupLevels[group];
    const levelIndex = levels.indexOf(currentLevel);
    if (levelIndex !== -1 && (!teamName || teamName === levelIndex + 1)) {
      const team = teams[levelIndex];
      if (result[group][team]) {
        result[group][team].push(...validPartners);
      }
    }
  }

  for (const partner of partners) {
    const downline = await getGroupDownline({
      userId: partner._id,
      groupName,
      currentLevel: currentLevel + 1,
      teamName
    });

    for (const group of selectedGroups) {
      const { teams } = groupLevels[group];
      teams.forEach((team, index) => {
        if ((!teamName || teamName === index + 1) && result[group][team]) {
          result[group][team].push(...(downline[group]?.[team] || []));
        }
      });
    }
  }

  // console.timeEnd(label);
  return result;
}


// const getDownlineArray = async ({ userId, currentLevel = 1, listShow = true, maxLength = Infinity }) => {
//   const completeDownline = [];
//   let totalActive = 0;
//   let totalInactive = 0;
//   let total = 0;

//   const fetchDownline = async (userId, currentLevel) => {
//     if (currentLevel > maxLength) return;

//     const partners = await UserModel.find({ sponsor: userId }).populate({ path: "account", select: "-_id walletAddress" });

//     for (const partner of partners) {
//       total++;
//       if (partner.active.isActive && partner.active.isVerified) {
//         totalActive++;
//       } else {
//         totalInactive++;
//       }
//       if (listShow) {
//         completeDownline.push({
//           id: partner?.id,
//           username: partner?.username,
//           referralLink: partner?.referralLink,
//           walletAddress: partner?.account,
//           investment: partner?.investment,
//           income: partner?.income,
//           active: partner?.active,
//           partnersLength: partner?.partners?.length,
//           createdAt: partner?.createdAt,
//           partners: [],
//         });
//       }

//       await fetchDownline(partner?._id, currentLevel + 1);
//     }
//   };

//   await fetchDownline(userId, currentLevel);
//   return {
//     downline: completeDownline,
//     totalActive,
//     totalInactive,
//     total
//   };
// };

// const getDownlineArray = async (userId) => {
//   try {
//     const downline = await UserModel.aggregate([
//       {
//         $match: { _id: new mongoose.Types.ObjectId(userId) }
//       },
//       {
//         $graphLookup: {
//           from: "users",
//           startWith: "$_id",
//           connectFromField: "_id",
//           connectToField: "sponsor",
//           as: "downline",
//           depthField: "level"
//         }
//       },
//       {
//         $addFields: {
//           totalInvestment: { $sum: "$downline.investment" },
//           downlineCount: { $size: "$downline" },
//           levelCount: {
//             $cond: [
//               { $gt: [{ $size: "$downline" }, 0] },
//               { $add: [{ $max: "$downline.level" }, 1] },
//               0
//             ]
//           },
//           teamInvestments: {
//             $map: {
//               input: "$partners",   // direct partners list
//               as: "partnerId",
//               in: {
//                 partner: "$$partnerId",
//                 total: {
//                   $sum: {
//                     $map: {
//                       input: {
//                         $filter: {
//                           input: "$downline",
//                           as: "d",
//                           cond: { $eq: ["$$d.sponsor", "$$partnerId"] } // us partner ka subtree
//                         }
//                       },
//                       as: "pDown",
//                       in: "$$pDown.investment"
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           username: 1,
//           investment: 1,
//           sponsor: 1,
//           partners: 1,
//           "downline._id": 1,
//           "downline.username": 1,
//           "downline.investment": 1,
//           "downline.sponsor": 1,
//           "downline.level": 1,
//           totalInvestment: 1,
//           downlineCount: 1,
//           levelCount: 1,
//           teamInvestments: 1
//         }
//       }
//     ]);

//     return downline[0] || {};
//   } catch (error) {
//     console.error("❌ Error in getDownlineArray:", error);
//     throw error;
//   }
// };
const getDownlineArray = async (userId) => {
  try {
    const downline = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          as: "downline",
          depthField: "level"
        }
      },
      // ✅ Populate income for root user
      {
        $lookup: {
          from: "incomedetails",
          localField: "income",
          foreignField: "_id",
          as: "income"
        }
      },
      {
        $addFields: {
          income: { $arrayElemAt: ["$income", 0] }
        }
      },
      // ✅ Populate income for downline users
      {
        $lookup: {
          from: "incomedetails",
          localField: "downline.income",
          foreignField: "_id",
          as: "downlineIncomes"
        }
      },
      // ✅ Lookup sponsor usernames for downline
      {
        $lookup: {
          from: "users",
          localField: "downline.sponsor",
          foreignField: "_id",
          as: "sponsorUsers"
        }
      },
      {
        $addFields: {
          downline: {
            $map: {
              input: "$downline",
              as: "dl",
              in: {
                $mergeObjects: [
                  "$$dl",
                  {
                    // attach income object
                    income: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$downlineIncomes",
                            as: "inc",
                            cond: { $eq: ["$$inc._id", "$$dl.income"] }
                          }
                        },
                        0
                      ]
                    },
                    // attach sponsor.username
                    sponsorUser: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$sponsorUsers",
                                as: "su",
                                cond: { $eq: ["$$su._id", "$$dl.sponsor"] }
                              }
                            },
                            as: "su",
                            in: { _id: "$$su._id",id: "$$su.id", username: "$$su.username",account: "$$su.account",active: "$$su.active" }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // ✅ Sort downline by level
      {
        $set: {
          downline: {
            $sortArray: { input: "$downline", sortBy: { level: 1 } }
          }
        }
      },
      {
        $addFields: {
          totalInvestment: { $sum: "$downline.investment" },
          downlineCount: { $size: "$downline" },
          levelCount: {
            $cond: [
              { $gt: [{ $size: "$downline" }, 0] },
              { $add: [{ $max: "$downline.level" }, 1] },
              0
            ]
          },
          teamInvestments: {
            $map: {
              input: "$partners",
              as: "partnerId",
              in: {
                partner: "$$partnerId",
                total: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$downline",
                          as: "d",
                          cond: { $eq: ["$$d.sponsor", "$$partnerId"] }
                        }
                      },
                      as: "pDown",
                      in: "$$pDown.investment"
                    }
                  }
                }
              }
            }
          },
          ids: "$downline._id"
        }
      },
      {
        $project: {
          id: 1,
          username: 1,
          account: 1,
          active: 1,
          investment: 1,
          sponsor: 1,
          partners: 1,
          income: 1,
          downline: {
            _id: 1,
            id: 1,
            username: 1,
            investment: 1,
            account: 1,
            active: 1,
            level: 1,
            income: 1,
            sponsorUser: 1
          },
          totalInvestment: 1,
          downlineCount: 1,
          levelCount: 1,
          teamInvestments: 1,
          ids: 1
        }
      }
    ]);

    return downline[0] || { downline: [], ids: [] };
  } catch (error) {
    console.error("❌ Error in getDownlineArray:", error);
    throw error;
  }
};




const getDownlineData = async ({
  userId,
  currentLevel = 1,
  listDownlineShow = true,
  maxLength
}) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          as: "downline",
          depthField: "level"
        }
      },
      {
        $addFields: {
          ids: maxLength
            ? { $slice: ["$downline._id", maxLength] }
            : "$downline._id",
          downline: maxLength
            ? { $slice: ["$downline", maxLength] }
            : "$downline",
          levelCount: {
            $cond: [
              { $gt: [{ $size: "$downline" }, 0] },
              { $add: [{ $max: "$downline.level" }, currentLevel] },
              0
            ]
          },
          totalInvestment: {
            $add: [
              "$investment",
              { $sum: "$downline.investment" }
            ]
          }
        }
      },
      // ✅ lookup for user's income
      {
        $lookup: {
          from: "incomedetails",
          localField: "income",
          foreignField: "_id",
          as: "income"
        }
      },
      { $unwind: { path: "$income", preserveNullAndEmptyArrays: true } },
      // ✅ lookup for downline incomes
      {
        $lookup: {
          from: "incomedetails",
          localField: "downline.income",
          foreignField: "_id",
          as: "downlineIncomes"
        }
      }
    ];

    if (listDownlineShow) {
      pipeline.push({
        $project: {
          id: 1,
          email: 1,
          mobile: 1,
          account: 1,
          username: 1,
          sponsor: 1,
          investment: 1,
          ids: 1,
          levelCount: 1,
          totalInvestment: 1,
          income: 1,
          downline: {
            _id: 1,
            id: 1,
          email: 1,
          mobile: 1,
          account: 1,
            username: 1,
            sponsor: 1,
            investment: 1,
            active: 1,
            level: 1,
            income: 1
          },
          downlineIncomes: 1
        }
      });
    } else {
      pipeline.push({
        $project: {
          id: 1,
          email: 1,
          mobile: 1,
          account: 1,
          username: 1,

          sponsor: 1,
          active: 1,
          investment: 1,
          ids: 1,
          levelCount: 1,
          totalInvestment: 1,
          income: 1
        }
      });
    }

    const result = await UserModel.aggregate(pipeline);
    const data = result[0] || { downline: [], ids: [], totalInvestment: 0 };

    // ✅ build income map for downline
    let incomeMap = {};
    if (data.downlineIncomes && data.downlineIncomes.length > 0) {
      incomeMap = data.downlineIncomes.reduce((acc, inc) => {
        acc[inc._id.toString()] = inc;
        return acc;
      }, {});
    }

    // ✅ inject income details into downline
    if (data.downline && data.downline.length > 0) {
      data.downline = data.downline.map(u => ({
        ...u,
        income: incomeMap[u.income] || null
      }));
    }

    // ✅ Tree build same as before
    if (data.downline && data.downline.length > 0) {
      const userIdStr = userId.toString();
      const nodeMap = new Map();

      data.downline.forEach(u => {
        nodeMap.set(u._id.toString(), { ...u, children: [] });
      });

      let rootChildren = [];

      data.downline.forEach(u => {
        const sponsorId = u.sponsor?.toString();
        if (sponsorId && nodeMap.has(sponsorId)) {
          nodeMap.get(sponsorId).children.push(nodeMap.get(u._id.toString()));
        } else if (sponsorId === userIdStr) {
          rootChildren.push(nodeMap.get(u._id.toString()));
        }
      });

      data.tree = {
        _id: data._id,
        id: data.id,
        email: data.email,
        mobile: data.mobile,
        username: data.username,
        sponsor: data.sponsor,
        investment: data.investment,
        active:data.active,
        income: data.income || null,
        children: rootChildren
      };
    } else {
      data.tree = {
        _id: data._id,
        id: data.id,
        email: data.email,
        mobile: data.mobile,
        username: data.username,
        sponsor: data.sponsor,
        investment: data.investment,
        active:data.active,
        income: data.income || null,
        children: []
      };
    }

    delete data.downlineIncomes; // cleanup

    return data;
  } catch (error) {
    console.error("❌ Error in getDownlineData:", error);
    throw error;
  }
};



// ------------------- NEW LOGIC START------------------------
const getDownlineArrayRoyalty = async (userId, packageAmount = 2) => {
  try {
    const downline = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "sponsor",
          as: "downline",
          depthField: "level",
        }
      },
      {
        $addFields: {
          totalInvestment: { $sum: "$downline.investment" },
          downlineCount: { $size: "$downline" },
          levelCount: {
            $cond: [
              { $gt: [{ $size: "$downline" }, 0] },
              { $add: [{ $max: "$downline.level" }, 1] },
              0
            ]
          },
          ids: "$downline._id",
          // ✅ Direct count (Level-1)
          directCount: {
            $size: {
              $filter: {
                input: "$downline",
                as: "d",
                cond: { $eq: ["$$d.level", 1] }
              }
            }
          },
          // ✅ Direct users array with details
          directUsers: {
            $map: {
              input: {
                $filter: {
                  input: "$downline",
                  as: "d",
                  cond: { $eq: ["$$d.level", 1] }
                }
              },
              as: "du",
              in: {
                _id: "$$du._id",
                username: "$$du.username",
                account: "$$du.account",
                investment: "$$du.investment"
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "packages",
          let: { downlineIds: "$ids" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$amount", Number(packageAmount)] },
                    { $gt: [{ $size: "$users" }, 0] }
                  ]
                }
              }
            },
            { $unwind: "$users" },
            {
              $match: {
                $expr: { $in: ["$users", "$$downlineIds"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "users",
                foreignField: "_id",
                as: "userData"
              }
            },
            { $unwind: "$userData" },
            {
              $project: {
                _id: 0,
                packageTitle: "$title",
                packageAmount: "$amount",
                "userData._id": 1,
                "userData.username": 1,
                "userData.account": 1
              }
            }
          ],
          as: "downlineWithPackage"
        }
      },
      {
        $project: {
          username: 1,
          investment: 1,
          sponsor: 1,
          partners: 1,
          downline: {
            _id: 1,
            username: 1,
            investment: 1,
            sponsor: 1,
            level: 1
          },
          totalInvestment: 1,
          downlineCount: 1,
          levelCount: 1,
          ids: 1,
          directCount: 1,
          directUsers: 1,
          downlineWithPackage: 1
        }
      }
    ]);

    return downline[0] || { downline: [], ids: [], directUsers: [], downlineWithPackage: [] };
  } catch (error) {
    console.error("❌ Error in getDownlineArrayRoyalty:", error);
    throw error;
  }
};
// ------------------- NEW LOGIC END------------------------


// --------------- DOWNLINE PACKAGE BUY AND LETEST START -----------------
const getDownlinePackageUsers = async (downlineIds, packageAmount) => {
  try {
    if (!downlineIds || downlineIds.length === 0) {
      return { ids: [], downline: [] };
    }

    const result = await PackageModel.aggregate([
      {
        $match: { amount: Number(packageAmount) }
      },
      {
        $project: {
          matchedUsers: {
            $setIntersection: ["$users", downlineIds]
          }
        }
      }
    ]);

    const matchedIds = result[0]?.matchedUsers || [];

    if (matchedIds.length === 0) {
      return { ids: [], downline: [] };
    }

    // 🔎 Get user details
    const users = await UserModel.find(
      { _id: { $in: matchedIds } },
      { username: 1, investment: 1, account: 1 }
    ).lean();

    return {
      ids: matchedIds,
      downline: users
    };
  } catch (error) {
    console.error("❌ Error in getDownlinePackageUsers:", error);
    throw error;
  }
};
// --------------- DOWNLINE PACKAGE BUY AND LETEST START -----------------



async function calculateLevelMultiArrayDownline(userId, maxDepth = 3) {
  const pipeline = [
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) } // root user se start karo
    },
    {
      $graphLookup: {
        from: "users",
        startWith: "$_id",          // root user se start
        connectFromField: "_id",
        connectToField: "sponsor",
        as: "downlines",
        maxDepth: maxDepth,         // jitna deep jana hai
        depthField: "level"
      }
    },
    {
      $project: {
        _id: 1,
        id: 1,
        username: 1,
        email: 1,
        mobile: 1,
        picture: 1,
        account: 1,
        investment: 1,
        active: 1,
        downlines: 1
      }
    }
  ];

  const result = await UserModel.aggregate(pipeline);

  if (!result || result.length === 0) {
    return { teamA: [], teamB: [], teamC: [] };
  }

  const root = result[0];
  const teamA = [];
  const teamB = [];
  const teamC = [];

  root.downlines.forEach(member => {
    if (member.level === 0) teamA.push(member); // Direct partners
    if (member.level === 1) teamB.push(member); // Next level
    if (member.level === 2) teamC.push(member); // Next next level
  });

  return { teamA, teamB, teamC };
}








module.exports = { getTeamsDownline, getAllTeamsDownline, getDownlineTree, getGroupDownline, getDownlineArray, getDownlineData, getDownlineArrayRoyalty, getDownlinePackageUsers,calculateLevelMultiArrayDownline };