namespace TheGrailLordsOfBretonnia {

    export namespace ArmourySystem {

        export type BasicSet = {
            ArmourId: string
            FaceId: string
            HelmetId: string
            WeaponId: string
            ShieldId: string        
        }

        type CqiToBasicSet = {
            Cqi: number
            BasicSet: BasicSet
        }

        const VERSION = 1
        const SAVE_DATA_SLOT = "ADMIRALNELSON_ARMOURY_SYSTEM_DATA"

        const logger = new Logger(`Admiralnelson ArmourySystem`)

        const WhitelistedFactions: Set<string> = new Set<string>()
        const WhitelistedSubAgentKeys: Set<string> = new Set<string>()

        const AnciliaryArmourKeys: Set<string> = new Set<string>()
        const AnciliaryHelmetKeys: Set<string> = new Set<string>()
        const AnciliaryWeaponKeys: Set<string> = new Set<string>()
        const AnciliaryShieldKeys: Set<string> = new Set<string>()

        type ArmourySystemSaveData = {
            Version: number
            CqiToAssociatedBasicSet: CqiToBasicSet[]
        }

        const ThumbnailFilenamesToAssociatedBasicSet: Map<string, BasicSet> = new Map<string, BasicSet>()
        const AnciliaryCompatibilities: Map<string, Set<string>> = new Map<string, Set<string>>()
        const ArmouredCharacters: Set<ArmouredCharacter> = new Set<ArmouredCharacter>()

        let ArmourySystemData: ArmourySystemSaveData | null = null

        export function RegisterFaction(factionKey: string) {
            WhitelistedFactions.add(factionKey)
        }
                
        export function RegisterSubtypeAgent(agentKey: string) {
            WhitelistedSubAgentKeys.add(agentKey)
            if(!AnciliaryCompatibilities.has(agentKey)) AnciliaryCompatibilities.set(agentKey, new Set<string>())
        }

        export function RegisterThumbnailFilenamesToAssociatedBasicSet(thumbnail: string, basicSet: BasicSet) {
            ThumbnailFilenamesToAssociatedBasicSet.set(thumbnail.toLowerCase(), basicSet)
            logger.Log(`Registering ${thumbnail} with value of ${JSON.stringify(basicSet)}`)
        }

        export function IsAnciliaryExists(anciliaryKey: string): boolean {
            const armour = Array.from(AnciliaryArmourKeys).includes(anciliaryKey)
            const helmet = Array.from(AnciliaryHelmetKeys).includes(anciliaryKey)
            const weapon = Array.from(AnciliaryWeaponKeys).includes(anciliaryKey)
            const shield = Array.from(AnciliaryShieldKeys).includes(anciliaryKey)
            return armour || helmet || weapon || shield
        }

        export function MakeThisItemCompatibleWithAgent(agentKey: string, anciliaries: string[]) {            
            const compat = AnciliaryCompatibilities.get(agentKey)
            if(compat == null) return
            for (const anciliary of anciliaries) {
                if(IsAnciliaryExists(anciliary)) compat.add(anciliary)
                else logger.LogWarn(`anciliary is not registered in the system: ${anciliary}`)
            }             
           
        }
        
        export function Initialise() {
            setTimeout(() => {
                Begin()
            }, 100);
        }

        function GetBasicSetFromArmourySystemData(character: Character): BasicSet | null {
            if(ArmourySystemData == null) {
                logger.LogError(`GetBasicSetFromArmourySystemData: ArmourySystemData was null`)
                throw(`GetBasicSetFromArmourySystemData failed`)
            }

            const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == character.CqiNo)
            if(index >= 0) return ArmourySystemData.CqiToAssociatedBasicSet[index].BasicSet
            return null
        }

        function AddCqiToArmourySystemData(character: ArmouredCharacter, basicSet: BasicSet) {
            if(ArmourySystemData == null) {
                logger.LogError(`AddCqiToArmourySystemData: ArmourySystemData was null`)
                throw(`AddCqiToArmourySystemData failed`)
            }

            const index = ArmourySystemData.CqiToAssociatedBasicSet.findIndex( armouredCqi => armouredCqi.Cqi == character.CqiNo)
            if(index >= 0) {
                ArmourySystemData.CqiToAssociatedBasicSet[index].BasicSet = basicSet
            } else {
                ArmourySystemData.CqiToAssociatedBasicSet.push({
                    Cqi: character.CqiNo,
                    BasicSet: basicSet
                })
            }
        }

        function Begin() {
            const validate = Validate()
            if(!validate[0]) {
                alert(`Failed to initialise the armoury system!\nSome of the armoury data is not initalised! Reason: ${validate[1]}`)
                return false
            }

            InitialiseForTheFirstTime()
            if(!LoadData()) {
                alert(`Failed to initialise the armoury system!\nYour campaign is probably toased. Please see the console log!`)
                return false
            }

            try {
                InitialiseArmourySystemForCharacters()
                DeserialiseArmouredCharacters()
                ApplyTheAssets()
                return true   
            } catch (error) {
                alert(`Failed to initialise the armoury system!\nYour campaign is probably toased. Please see the console log!\nReason: ${error}`)
                logger.LogError(error as string)
            }

            return false
        }

        function Validate(): [isOK: boolean, whatError: string]  {
            if(ThumbnailFilenamesToAssociatedBasicSet.size == 0) {
                return [false, "ThumbnailFilenamesToAssociatedBasicSet is empty"]
            }

            if(WhitelistedFactions.size == 0) {
                return [false, "WhitelistedFactions is empty"]
            }

            if(WhitelistedSubAgentKeys.size == 0) {
                return [false, "WhitelistedSubAgentKeys is empty"]
            }

            for (const [key, value] of ThumbnailFilenamesToAssociatedBasicSet) {
                if(key == "") return [false, "empty key"]
                if(value.ArmourId == "") return [false, `ArmourId is empty for ${key}`]
                if(value.FaceId == "") return [false, `FaceId is empty for ${key}`]
                if(value.HelmetId == "") return [false, `HelmetId is empty for ${key}`]
                if(value.ShieldId == "") return [false, `ShieldId is empty for ${key}`]
                if(value.WeaponId == "") return [false, `WeaponId is empty for ${key}`]
            }

            return [true, "all good"]
        }

        function InitialiseForTheFirstTime(): boolean {
            if(LoadData()) return false

            ArmourySystemData = {
                Version: VERSION,
                CqiToAssociatedBasicSet: [],
            }
            SaveData()
            return true
        }

        function InitialiseArmourySystemForCharacters() {
            if(ArmourySystemData == null) {
                logger.LogError(`InitialiseArmourySystemForCharacter: ArmourySystemData was null!`)
                throw(`InitialiseArmourySystemForCharacter failed`)
            }

            const characters = FindAllCharacters().filter( character => GetBasicSetFromArmourySystemData(character) == null )

            for (const character of characters) {
                const newArmouredCharacter = new ArmouredCharacter(character)
                AddCqiToArmourySystemData(newArmouredCharacter, GetCharacterBasicFaceAndArmourSet(newArmouredCharacter))
            }
            SaveData()
        }

        function DeserialiseArmouredCharacters() {
            if(ArmourySystemData == null) {
                logger.LogError(`DeserialisedArmouredCharacter: ArmourySystemData was null!`)
                throw(`DeserialisedArmouredCharacter failed`)
            }

            for (const cqiAndBasicSet of ArmourySystemData.CqiToAssociatedBasicSet) {
                const character = FindCharacter(cqiAndBasicSet.Cqi)
                if(character == null) {
                    logger.LogError(`Found invalid CQI number ${cqiAndBasicSet.Cqi}`)
                } else {
                    ArmouredCharacters.add(new ArmouredCharacter(character))
                }
            }
        }

        function LoadData(): boolean {
            try {
                const data = localStorage.getItem(SAVE_DATA_SLOT) as string  
                if(data == null) return false

                ArmourySystemData = JSON.parse(data)

            } catch (error) {
                logger.LogError(`failed to load saved Armoury Data. Save game is toasted reason: ${error}`)
                return false
            }
            return true
        }

        function SaveData() {
            localStorage.setItem(SAVE_DATA_SLOT, JSON.stringify(ArmourySystemData))
        }

        function FindAllCharacters(): Character[] {
            const factions = []
            for (const facitonKey of WhitelistedFactions) {
                factions.push(GetFactionByKey(facitonKey))
            }

            const characters = []
            for (const faction of factions) {
                if(faction == null) {
                    logger.LogError(`FindAllCharacters: found null faction`)
                    throw(`FindAllCharacters failed`)
                }
                const charactersInFaction = faction?.Characters.filter( character => WhitelistedSubAgentKeys.has(character.SubtypeKey) )
                for (const character of charactersInFaction) {
                    characters.push(character)
                }
            }

            return characters
        }

        function GetCharacterBasicFaceAndArmourSet(character: ArmouredCharacter): BasicSet {
            if(ArmourySystemData == null) {
                logger.LogError(`GetCharacterBasicFaceAndArmourSet: ArmourySystemData is null! The module has not been initialised!`)
                throw(`GetCharacterBasicFaceAndArmourSet failed`)
            }
            if(!WhitelistedSubAgentKeys.has(character.SubtypeKey)) {
                logger.LogError(`GetCharacterBasicFaceAndArmourSet: This character ${character.SubtypeKey} ${character.LocalisedFullName} is not allowed to use the armory system`)
                throw(`GetCharacterBasicFaceAndArmourSet failed`)
            }

            //this where all the magic happens
            const thumbnailFileName = character.ThumbnailFileName.toLowerCase()

            let basicSet = GetBasicSetFromArmourySystemData(character)
            if(basicSet == null) {
                const originalBasicSet = ThumbnailFilenamesToAssociatedBasicSet.get(thumbnailFileName)

                if(originalBasicSet == null) {
                    logger.LogError(`GetCharacterBasicFaceAndArmourSet: this characther does not have basic set assigned!`)
                    throw(`GetCharacterBasicFaceAndArmourSet failed`)
                }

                basicSet = originalBasicSet
                return basicSet
            }

            return basicSet
        }

        function ApplyTheAssets() {
            for (const armouredCharacter of ArmouredCharacters) {
                armouredCharacter.WearArmour()
            }
        }

        function FindArmouredCharacter(character: Character): ArmouredCharacter | undefined {
            if(ArmourySystemData == null) {
                logger.LogError(`CastToArmouredCharacter: ArmourySystemData is null and not initialised`)
                throw(`CastToArmouredCharacter failed`)
            }
            return Array.from(ArmouredCharacters).find(armouredCharacter => armouredCharacter.CqiNo == character.CqiNo)            
        }

        function GetArmourId(anciliariesKeys: string[]): string | null {
            const knownArmours = Array.from(AnciliaryArmourKeys)
            const difference = knownArmours.filter(knownArmour => anciliariesKeys.includes(knownArmour))
            if(difference.length == 0) return null
            return difference[0]
        }

        function GetHelmetId(anciliariesKeys: string[]): string | null {
            const knownHelmets = Array.from(AnciliaryHelmetKeys)
            const difference = knownHelmets.filter(knownHelmet => anciliariesKeys.includes(knownHelmet))
            if(difference.length == 0) return null
            return difference[0]
        }

        function GetWeaponId(anciliariesKeys: string[]): string | null {
            const knownWeapons = Array.from(AnciliaryWeaponKeys)
            const difference = knownWeapons.filter(knownWeapon => anciliariesKeys.includes(knownWeapon))
            if(difference.length == 0) return null
            return difference[0]
        }

        function GetShieldId(anciliariesKeys: string[]): string | null {
            const knownShields = Array.from(AnciliaryShieldKeys)
            const difference = knownShields.filter(knownShield => anciliariesKeys.includes(knownShield))
            if(difference.length == 0) return null
            return difference[0]
        }

        function IsItemCompatibleWithAgent(agentKey: string, anciliaryKey: string): boolean {
            const anciliaries = AnciliaryCompatibilities.get(agentKey)
            if(anciliaries == null) return false
            const ancillariesArray = Array.from(anciliaries)
            return ancillariesArray.includes(anciliaryKey)
        }      


        class ArmouredCharacter extends Character {
            constructor(character: Character) {
                super({
                    characterObject: character.GetInternalInterface()
                })
            }
    
            get FaceId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`FaceId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`FaceId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter FaceId failed`)
                }
                return basicArmour.FaceId
            }
    
            get BasicArmourId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicArmourId: ArmourySystemData is null and not initialised`)
                    throw(`getter BasicArmourId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicArmourId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicArmourId failed`)
                }
                return basicArmour.ArmourId
            }
    
            get BasicHelmetId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicHelmetId: ArmourySystemData is null and not initialised`)
                    throw(`getter BasicHelmetId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicHelmetId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicHelmetId failed`)
                }
                return basicArmour.HelmetId
            }
    
            get BasicShieldId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicShieldId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicShieldId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicShieldId failed`)
                }
                return basicArmour.ShieldId
            }
    
            get BasicWeaponId(): string {
                if(ArmourySystemData == null) {
                    logger.LogError(`BasicWeaponId: ArmourySystemData is null and not initialised`)
                    throw(`getter FaceId failed`)
                }
    
                const basicArmour = GetBasicSetFromArmourySystemData(this)
                if(basicArmour == null) {
                    logger.LogError(`BasicShieldId: Armoury system is not applied to this character ${this.CqiNo} ${this.LocalisedFullName}`)
                    throw(`getter BasicShieldId failed`)
                }
                return basicArmour.WeaponId
            }
    
            OnChangedItem() {
                this.WearArmour()
            }
    
            WearArmour() {
                const variantMeshId = this.GetVariantMeshId()
                logger.Log(`this character ${this.CqiNo} ${this.LocalisedFullName} will use ${variantMeshId}`)
                //this.ChangeModelAppearance(variantMeshId)
                alert(`this character ${this.CqiNo} ${this.LocalisedFullName} will use ${variantMeshId}`)
            }
    
            GetVariantMeshId(): string {
                const FaceId = this.FaceId 
                const helmetId = GetHelmetId(this.AnciliaryKeys) ?? this.BasicHelmetId
                const armourId = GetArmourId(this.AnciliaryKeys) ?? this.BasicArmourId
                const weaponId = GetWeaponId(this.AnciliaryKeys) ?? this.BasicWeaponId
                const shieldId = GetShieldId(this.AnciliaryKeys) ?? this.BasicShieldId
                
                return `ArmourySystem_${FaceId}_${helmetId}_${armourId}_${weaponId}_${shieldId}`
            }
    
            CanUseShield(): boolean {
                return false
            }
        }

    }

   
    
}