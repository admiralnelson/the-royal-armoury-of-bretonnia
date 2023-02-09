namespace TheGrailLordsOfBretonnia {

    type ThumbnailFilenameToBasicSet = {
        [thumbnailFile: string]: ArmourySystem.BasicSet
    }

    const ARMOURY_DATA: ThumbnailFilenameToBasicSet = {
        ["ui/portraits/portholes/admiralnelson/bret_lord_massif_5.png"] : {
            FaceId: "admiralnelson_face_5",
            HelmetId: "hair_5",
            ArmourId: "basic_armour_5",
            WeaponId: "basic_1hsword_5",
            ShieldId: "basic_shield_5"
        },
        ["ui/portraits/portholes/admiralnelson/bret_lord_massif_1.png"] : {
            FaceId: "admiralnelson_face_1",
            HelmetId: "hair_1",
            ArmourId: "basic_armour_1",
            WeaponId: "basic_2haxe_1",
            ShieldId: ""
        }
    }

    ArmourySystem.RegisterFaction("wh_main_brt_bretonnia")
    ArmourySystem.RegisterSubtypeAgent("admiralnelson_bret_lord_massif_sword_shield_agent_key")
    for (const [fileName, basicSet] of Object.entries(ARMOURY_DATA)) {
        ArmourySystem.RegisterThumbnailFilenamesToAssociatedBasicSet(fileName, basicSet)
    }
    ArmourySystem.RegisterArmour([
        `wh_main_anc_armour_glittering_scales`,
        `wh_dlc07_anc_armour_armour_of_the_midsummer_sun`,
        `wh_dlc07_anc_armour_cuirass_of_fortune`,
        `wh_main_anc_armour_armour_of_fortune`,
        `wh_dlc07_anc_armour_gilded_cuirass`,
        `wh_dlc07_anc_armour_the_grail_shield`,
        `wh_main_anc_armour_the_lions_shield`,
        `wh_main_anc_armour_armour_of_destiny`,
        `wh_main_anc_armour_armour_of_silvered_steel`,
        `wh_main_anc_armour_gamblers_armour`
    ])
    ArmourySystem.MakeThisItemIncompatibleWithAgent("admiralnelson_bret_lord_massif_sword_shield_agent_key", [`wh_main_anc_armour_gamblers_armour`])
    
}