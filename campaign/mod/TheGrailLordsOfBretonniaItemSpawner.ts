namespace TheGrailLordsOfBretonnia {

    export type AnciliaryData = {
        Weapon?: {
            Rare?: string[]
            Uncommon?: string[]
            Common?: string[]
        },
        Armour?: {
            Rare?: string[]
            Uncommon?: string[]
            Common?: string[]
        }
        Helmet?: {
            Rare?: string[]
            Uncommon?: string[]
            Common?: string[]
        }
    }    

    const enum RarityType {
        Rare = "Rare",
        Uncommon = "Uncommon",
        Common = "Common"
    }

    const logger = new Logger(`TheGrailLordsOfBretonnia.ItemSpawner`)

    const console = {
        log: (s: string) => logger.Log(s),
        warn: (s: string) => logger.LogWarn(s),
        err: (s: string) => logger.LogError(s)
    }

    const ancillaryData: AnciliaryData = {
        Weapon: {
            Rare: [],
            Uncommon: [],
            Common: []
        },
        Armour: {
            Rare: [],
            Uncommon: [],
            Common: []
        },
        Helmet: {
            Rare: [],
            Uncommon: [],
            Common: []
        }
    }

    let bAlreadyRunning = false
    let bBypassDiceCheck = false
    let BonusChanceDebug = 0
    let DebugAlwaysSpawnRarity = ""

    export namespace ItemSpawner {

        export function SetAlwaysSpawnRarity(rarity: "rare"|"uncommon"|"common"|"all") {
            DebugAlwaysSpawnRarity = rarity
            alert(`DebugAlwaysSpawnRarity is set to ${DebugAlwaysSpawnRarity}`)
        }

        export function BonusChanceDebugSet(howMuch: number) {
            BonusChanceDebug = howMuch
            alert(`BonusChanceDebug is set to ${BonusChanceDebug}`)
        }

        export function DisableDiceRollCheck(yes: boolean) {
            bBypassDiceCheck = yes
        }

        export function AddAnciliariesData(data: AnciliaryData) {
            if(data.Armour) {
                if(ancillaryData.Armour == null) {
                    return
                }

                if(data.Armour.Rare != null) {
                    ancillaryData.Armour.Rare = ancillaryData.Armour.Rare?.concat(data.Armour.Rare)
                }

                if(data.Armour.Uncommon != null) {
                    ancillaryData.Armour.Uncommon = ancillaryData.Armour.Uncommon?.concat(data.Armour.Uncommon)
                }

                if(data.Armour.Common != null) {
                    ancillaryData.Armour.Common = ancillaryData.Armour.Common?.concat(data.Armour.Common)
                }
            }

            if(data.Helmet) {
                if(ancillaryData.Helmet == null) {
                    return
                }

                if(data.Helmet.Rare != null) {
                    ancillaryData.Helmet.Rare = ancillaryData.Helmet.Rare?.concat(data.Helmet.Rare)
                }

                if(data.Helmet.Uncommon != null) {
                    ancillaryData.Helmet.Uncommon = ancillaryData.Helmet.Uncommon?.concat(data.Helmet.Uncommon)
                }

                if(data.Helmet.Common != null) {
                    ancillaryData.Helmet.Common = ancillaryData.Helmet.Common?.concat(data.Helmet.Common)
                }
            }

            if(data.Weapon) {
                if(ancillaryData.Weapon == null) {
                    return
                }

                if(data.Weapon.Rare != null) {
                    ancillaryData.Weapon.Rare = ancillaryData.Weapon.Rare?.concat(data.Weapon.Rare)
                }

                if(data.Weapon.Uncommon != null) {
                    ancillaryData.Weapon.Uncommon = ancillaryData.Weapon.Uncommon?.concat(data.Weapon.Uncommon)
                }

                if(data.Weapon.Common != null) {
                    ancillaryData.Weapon.Common = ancillaryData.Weapon.Common?.concat(data.Weapon.Common)
                }
            }            


            console.log(`done adding ancillaries data`)
            console.log(JSON.stringify(ancillaryData))
        }

        export function Init() {
            if(bAlreadyRunning) return
            bAlreadyRunning = true
            SetupOnTriggerPostBattleAncillaries()
        }

        function AttemptToAwardMagicalItem(context: IContext): void {
            if(context.character == null) return
            if(context.pending_battle == null) return

            const lord = TryCastCharacterToLord(WrapICharacterObjectToCharacter(context.character()))
            if(lord == null) return

            const isBretonnianFaction = BretonnianFactions.includes(lord.FactionKey)
            if(!isBretonnianFaction) return
            
            const attackerFacKey = cm.pending_battle_cache_get_attacker(1)
            const defenderFacKey = cm.pending_battle_cache_get_defender(1)
            
            const attacker = GetFactionByKey(attackerFacKey[2])
            const defender = GetFactionByKey(defenderFacKey[2])

            if(attacker == null) return
            if(defender == null) return

            if(attacker.GetFactionInterface().is_quest_battle_faction()) return
            if(defender.GetFactionInterface().is_quest_battle_faction()) return
            
            
            const campaignDifficulty = GetCampaignDifficultyLocal()
            let chance = 40 + BonusChanceDebug
            const bonusChance = lord.GetInternalInterface().post_battle_ancillary_chance()
            
            // mod the chance based on the bonus value state
            chance += bonusChance

            // mod the chance based on campaign difficulty (only if singleplayer)
            let campaignDiffMod = 8
            
            if(IsMultiplayer()) {
                // in mp, modify as if playing on normal difficulty
                campaignDiffMod = 6
            } else if (lord.Faction.IsHuman) {
                switch (campaignDifficulty) {
                    case 1:
                        campaignDiffMod = 8
                        break
                    case 0:
                        campaignDiffMod = 6
                        break
                    case -1:
                        campaignDiffMod = 4
                        break
                    case -2:
                        campaignDiffMod = 2
                        break
                    default:
                        break
                    }
            } else { // bots
                switch (campaignDifficulty) {
                    case 1:
                        campaignDiffMod = 0
                        break
                    case 0:
                        campaignDiffMod = 2
                        break
                    case -1:
                        campaignDiffMod = 4
                        break
                    case -2:
                        campaignDiffMod = 6
                        break
                    default:
                        campaignDiffMod = 8
                        break
                }
            }

            chance += campaignDiffMod
            
            let victoryTypeMod = 0
            const pendingBattle = context.pending_battle()
            if(pendingBattle.has_attacker() && 
                lord.CqiNo == pendingBattle.attacker().command_queue_index()) {
                const battleResult = pendingBattle.attacker_battle_result()
                switch (battleResult) {
                    case "close_victory":
                        victoryTypeMod = 2
                        break
                    case "decisive_victory":
                        victoryTypeMod = 4
                        break
                    case "heroic_victory":
                        victoryTypeMod = 6
                        break
                    default:
                        break
                }
            } else if(pendingBattle.has_defender()) {
                const battleResult = pendingBattle.defender_battle_result()
                switch (battleResult) {
                    case "close_victory":
                        victoryTypeMod = 2
                        break
                    case "decisive_victory":
                        victoryTypeMod = 4
                        break
                    case "heroic_victory":
                        victoryTypeMod = 6
                        break
                    default:
                        break
                }
            }

		    chance += victoryTypeMod
            chance = clamp(chance, 0, 100)

            const roll = !bBypassDiceCheck ? RandomNumber(100) : 0

            if(roll > chance) {
                console.warn(`roll failed for this guy ${lord.LocalisedFullName} roll was ${roll} chance was ${chance}`)
                return
            }

            console.warn(`AttemptToAwardMagicalItem: spawning now!`)
            AwardMagicalItem(lord, context)
        }

        export function AwardMagicalItem(lord: Lord, context?: IContext): boolean {
		    const rarityRoll = RandomNumber(100)
            
            let whatToRoll = RarityType.Common
            if(rarityRoll >= 90) 
                whatToRoll = RarityType.Rare
            else if(rarityRoll >= 61)
                whatToRoll = RarityType.Uncommon
            else
                whatToRoll = RarityType.Common

            if(DebugAlwaysSpawnRarity != "") {
                switch (DebugAlwaysSpawnRarity) {
                    case "rare":
                    whatToRoll = RarityType.Rare
                    break
                    case "uncommon":
                    whatToRoll = RarityType.Uncommon
                    break
                    case "common":
                    whatToRoll = RarityType.Common
                    break
                    default:
                    break
                }
            }                

            let whichItemToSpawn = ""
            const randomNumber = RandomNumber(10, 1)
            if (randomNumber <= 2)
                whichItemToSpawn = "Weapon"
            else if (randomNumber <= 6) 
                whichItemToSpawn = "Armour"
            else
                whichItemToSpawn = "Helmet"
            
            if(!BretonnianFactions.includes(lord.FactionKey)) {
                console.warn(`${lord.LocalisedFullName} not a bretonnian lord`)
                return false
            }

            let item = ``
            switch (whichItemToSpawn) {
                case "Weapon":
                    if(ancillaryData.Weapon == null) {
                        console.warn(`weapon bag was empty`)
                        return false
                    }
                    switch (whatToRoll) {
                        case RarityType.Rare:
                        if(ancillaryData.Weapon.Rare == null) {
                            console.warn(`weapon Rare bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Weapon.Rare) as string 
                        break
                        case RarityType.Uncommon:
                        if(ancillaryData.Weapon.Uncommon == null) {
                            console.warn(`weapon Uncommon bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Weapon.Uncommon) as string
                        break
                        case RarityType.Common:
                        if(ancillaryData.Weapon.Common == null) {
                            console.warn(`weapon Common bag was empty`)
                            return false
                        }   
                        break
                        default:
                        return false
                    }
                break
                case "Armour":
                    if(ancillaryData.Armour == null) {
                        console.warn(`Armour bag was empty`)
                        return false
                    }
                    switch (whatToRoll) {
                        case RarityType.Rare:
                        if(ancillaryData.Armour.Rare == null) {
                            console.warn(`Armour Rare bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Armour.Rare) as string 
                        break
                        case RarityType.Uncommon:
                        if(ancillaryData.Armour.Uncommon == null) {
                            console.warn(`Armour Uncommon bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Armour.Uncommon) as string
                        break
                        case RarityType.Common:
                        if(ancillaryData.Armour.Common == null) {
                            console.warn(`Armour Common bag was empty`)
                            return false
                        }
                        break
                        default:
                        return false
                    }
                break    
                case "Helmet":
                    if(ancillaryData.Helmet == null) {
                        console.warn(`Helmet bag was empty`)
                        return false
                    }
                    switch (whatToRoll) {
                        case RarityType.Rare:
                        if(ancillaryData.Helmet.Rare == null) {
                            console.warn(`Helmet Rare bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Helmet.Rare) as string 
                        break
                        case RarityType.Uncommon:
                        if(ancillaryData.Helmet.Uncommon == null) {
                            console.warn(`Helmet Uncommon bag was empty`)
                            return false
                        }
                        item = ChooseRandom(ancillaryData.Helmet.Uncommon) as string
                        break
                        case RarityType.Common:
                        if(ancillaryData.Helmet.Common == null) {
                            console.warn(`Helmet Common bag was empty`)
                            return false
                        }
                        break
                        default:
                        return false
                    }
                break
                default:
                return false
            }

            if(item == "") return false

            if(context) {
                common.ancillary(item, 100, context)
            } else {
                lord.Faction.AddAnciliary(item, false)
            }

            return true
        }

        function SetupOnTriggerPostBattleAncillaries() : void {
            core.add_listener(
                "award_random_magical_item",
                "TriggerPostBattleAncillaries",
                true,
                (context) => {
                    if(context.character == null) return
                    if(context.has_stolen_ancillary == null) return
    
                    const character = WrapICharacterObjectToCharacter(context.character())
                    const wonBattle = character.WasWinningBefore
                    const isGeneral = character.IsGeneralAndHasArmy
                    const wasAncillaryNotStolen = !context.has_stolen_ancillary()
    
                    if(wonBattle && isGeneral && wasAncillaryNotStolen) AttemptToAwardMagicalItem(context)
                },
                true
            )
    
            console.log(`SetupOnTriggerPostBattleAncillaries ok`)
        }

    }
}
