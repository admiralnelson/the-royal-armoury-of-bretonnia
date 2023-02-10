namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            ArmourySystem.Initialise()

            const faction = GetFactionByKey("wh_main_brt_bretonnia")
            if(!faction) return

            const anciliariesTest = [
                `wh_main_anc_armour_glittering_scales`,
                `wh_dlc07_anc_armour_armour_of_the_midsummer_sun`,
                `wh_dlc07_anc_armour_cuirass_of_fortune`,
                `wh_main_anc_armour_armour_of_fortune`,
                `wh_dlc07_anc_armour_gilded_cuirass`,
                `wh_dlc07_anc_armour_the_grail_shield`,
                `wh_main_anc_armour_the_lions_shield`,
                `wh_main_anc_armour_armour_of_destiny`,
                `wh_main_anc_armour_armour_of_silvered_steel`,
                `wh_main_anc_armour_gamblers_armour`,

                `wh2_dlc15_anc_follower_mandelour`,
                `wh_main_anc_follower_all_hedge_wizard`,
                `wh_main_anc_follower_all_men_bailiff`,
                `wh_main_anc_follower_all_men_boatman`,
                `wh_main_anc_follower_all_men_bodyguard`,
                `wh_main_anc_follower_all_men_bounty_hunter`,
                `wh_main_anc_follower_all_men_grave_robber`,
                `wh_main_anc_follower_all_men_initiate`,
                `wh_main_anc_follower_all_men_mercenary`,
                `wh_main_anc_follower_all_men_militiaman`,
                `wh_main_anc_follower_all_men_ogres_pit_fighter`,
                `wh_main_anc_follower_all_men_outlaw`,
                `wh_main_anc_follower_all_men_protagonist`,
                `wh_main_anc_follower_all_men_rogue`,
                `wh_main_anc_follower_all_men_servant`,
                `wh_main_anc_follower_all_men_smuggler`,
                `wh_main_anc_follower_all_men_soldier`,
                `wh_main_anc_follower_all_men_thug`,
                `wh_main_anc_follower_all_men_tollkeeper`,
                `wh_main_anc_follower_all_men_tomb_robber`,
                `wh_main_anc_follower_all_men_vagabond`,
                `wh_main_anc_follower_all_men_valet`,
                `wh_main_anc_follower_all_men_zealot`,
                `wh_main_anc_follower_all_student`,
                `wh_main_anc_follower_bretonnia_court_jester`,
                `wh_main_anc_follower_bretonnia_squire`,
                `wh_main_anc_follower_empire_estalian_diestro`,
                
                `admiralnelson_dragon_helmet_anciliary_key`,
                `admiralnelson_dragon_helmet_anciliary_key`,
                `admiralnelson_dragon_helmet_anciliary_key`

            ]

            for (const item of anciliariesTest) {
                faction.AddAnciliary(item, true)
            }
            
            new Lord({
                factionKey: "wh_main_brt_bretonnia",
                agentKey: "admiralnelson_bret_lord_massif_sword_shield_agent_key",
                regionKey: faction.FactionLeader?.CurrentRegionKey,
                lordCreatedCallback: (lord) => {
                    // alert(`thumbnail path is : ${lord.ThumbnailFileName.toLowerCase()}`)
                    // const fac = GetFactionByKey("wh_main_brt_bretonnia")
                    // if(fac == null) return

                    // let char = ""
                    // for (const c of fac.Characters) {
                    //     char = `${char}, ${c.LocalisedFullName}`
                    // }
                    // alert(char, () => {
                    //     lord.ChangeModelAppearance(`admiralnelson_brt_generic_lord_massif_sword_shield_art_key_1`)
                    // })
                } 
            })

            new Lord({
                factionKey: "wh_main_brt_bretonnia",
                agentKey: "admiralnelson_bret_lord_massif_agent_key",
                regionKey: faction.FactionLeader?.CurrentRegionKey,
                lordCreatedCallback: (lord) => {
                    console.log(`ok`)
                } 
            })

        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}