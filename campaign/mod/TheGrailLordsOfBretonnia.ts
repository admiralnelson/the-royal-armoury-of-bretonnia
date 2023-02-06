namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            const faction = GetFactionByKey("wh_main_brt_bretonnia")
            if(!faction) return
            
            new Lord({
                factionKey: "wh_main_brt_bretonnia",
                agentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                regionKey: faction.FactionLeader?.CurrentRegionKey,
                lordCreatedCallback: (lord) => {
                    alert(`thumbnail path is : ${lord.ThumbnailFileName.toLowerCase()}`)
                    const fac = GetFactionByKey("wh_main_brt_bretonnia")
                    if(fac == null) return

                    let char = ""
                    for (const c of fac.Characters) {
                        char = `${char}, ${c.LocalisedFullName}`
                    }
                    alert(char)
                } 
            })

            ArmourySystem.RegisterFaction("wh_main_brt_bretonnia")
            ArmourySystem.RegisterSubtypeAgent("admiralnelson_bret_lord_massif_sword_shield_agent_key")
            ArmourySystem.RegisterThumbnailFilenamesToAssociatedBasicSet(
                "ui/portraits/portholes/admiralnelson/bret_lord_massif_5.png", 
                ARMOURY_DATA["ui/portraits/portholes/admiralnelson/bret_lord_massif_5.png"])
            ArmourySystem.Initialise()

        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}