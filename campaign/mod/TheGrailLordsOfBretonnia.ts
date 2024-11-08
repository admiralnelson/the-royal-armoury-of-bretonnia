namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            ArmourySystem.RegisterFaction(BretonnianFactions)
            ArmourySystem.Initialise()

            ItemSpawner.Init()
            ItemSpawner.AddAnciliariesData(BretonnianAnciliaryData)

            this.CheckIfAssetPackageIsLoaded()
            this.CheckIfGenericLordPackageIsLoaded()
            this.CheckIfPaladinDataIsLoaded()
            
            this.SetupConsoleDebug()                        
        }

        private CheckIfGenericLordPackageIsLoaded(): void {
            if(!IsFileExistVFS("script/campaign/mod/bretlordlogger.lua")) {
                alert(`Missing dependency.\nRequired package: Bretonnia Generic Lord Pack.\n Visit: https://steamcommunity.com/sharedfiles/filedetails/?id=2867514081`)
            }
        }

        private CheckIfAssetPackageIsLoaded(): void {
            if(!IsFileExistVFS("variantmeshes/armour_sets/normal_admiralnelson_armour_1.rigid_model_v2")) {
                alert(`Missing dependency.\nRequired package: The Royal Armoury of Bretonnia Assets Package.\n Visit: https://steamcommunity.com/sharedfiles/filedetails/?id=2961310304`)
            }
        }

        private CheckIfPaladinDataIsLoaded(): void {
            if(!IsFileExistVFS("script/campaign/mod/genericpaladinspack.lua")) {
                alert(`Missing dependency.\nRequired package: The Royal Armoury of Bretonnia Paladin Data Package.\n`)
            }
        }

        private SetupConsoleDebug(): void {
            ConsoleHandler.Register(`armoury%-force%-install "(.*)"`, (param) => {
                if(param.length != 1) return


            })

            ConsoleHandler.Register(`armoury%-print%-factions`, () => {
                const factions = ArmourySystem.GetWhitelistedFactions()
                for (const iterator of factions) {
                    console.log(iterator)
                }
                alert(`see stdout or console logs to see the result`)
            })

            ConsoleHandler.Register(`armoury%-change%-thumbnail "(.*)" "(.*)"`, params => {
                if(params.length != 2) return

                const characterName = params[0].replaceAll(`"`, ``).trim()
                const thumbnailPath = params[1].replaceAll(`"`, ``).trim()

                let character = null
                const factionKeys = ArmourySystem.GetWhitelistedFactions()
                for (const factionKey of factionKeys) {
                    character = GetFactionByKey(factionKey)?.Lords.find( lord => lord.LocalisedFullName == characterName )
                    if(character) break
                }

                // search for paladins
                if(character == null) {
                    for (const factionKey of factionKeys) {
                        character = GetFactionByKey(factionKey)?.Champions.find( champion => champion.LocalisedFullName == characterName )
                        if(character) break
                    }
                }

                if(character == null) {
                    alert(`unable to find "${characterName}" as lord or paladin in the armoury system`)
                    return
                }

                if(!ArmourySystem.IsThisAgentSubtypeRegistered(character.SubtypeKey)) {
                    alert(`This character "${characterName}" does not use armoury system`)
                    return
                }

                if(!ArmourySystem.ChangeThumbnail(character, thumbnailPath)) {
                    alert(`an error occured please see the console logs/stdo`)
                }
            })

            ConsoleHandler.Register(`item%-spawner%-test "(.*)"`, params => {
                if(params.length != 1) return

                const characterName = params[0].replaceAll(`"`, ``).trim()
                
                let character = null
                const factionKeys = BretonnianFactions
                for (const factionKey of factionKeys) {
                    character = GetFactionByKey(factionKey)?.Lords.find( lord => lord.LocalisedFullName == characterName )
                    if(character) break
                }

                if(character == null) {
                    alert(`unable to find "${characterName}" as lord`)
                    return
                }

                if(!ItemSpawner.AwardMagicalItem(character)) {
                    alert(`Fail to spawn. Check console log.`)
                }
            })

            ConsoleHandler.Register(`item%-spawner%-set%-bonus (%d+)`, params => {
                if(params.length != 1) return

                ItemSpawner.BonusChanceDebugSet(Number(params[0]))
            })

            ConsoleHandler.Register(`item%-spawner%-always%-spawn (.*)`, params => {
                if(params.length != 1) return
                
                const rarity = params[0]
                switch (rarity) {
                    case "rare":
                    case "uncommon":
                    case "common":
                    case "all":                    
                    break
                    default:
                        alert("expected 2nd param: rare|uncommon|common|all")
                        return
                }

                ItemSpawner.SetAlwaysSpawnRarity(rarity)                
            })
        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}