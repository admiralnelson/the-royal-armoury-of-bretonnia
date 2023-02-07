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
        }
    }

    ArmourySystem.RegisterFaction("wh_main_brt_bretonnia")
    ArmourySystem.RegisterSubtypeAgent("admiralnelson_bret_lord_massif_sword_shield_agent_key")
    for (const [fileName, basicSet] of Object.entries(ARMOURY_DATA)) {
        ArmourySystem.RegisterThumbnailFilenamesToAssociatedBasicSet(fileName, basicSet)
    }
    
}