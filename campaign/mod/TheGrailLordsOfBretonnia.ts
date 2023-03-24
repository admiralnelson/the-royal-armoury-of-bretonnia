namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            ArmourySystem.Initialise()
            ArmourySystem.RegisterFaction(BretonnianFactions)

            ItemSpawner.Init()
            ItemSpawner.AddAnciliariesData(BretonnianAnciliaryData)

            this.SetupConsoleDebug()
        }

        private SetupConsoleDebug(): void {
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