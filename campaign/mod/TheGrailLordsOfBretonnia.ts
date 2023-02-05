namespace TheGrailLordsOfBretonnia {

    export const VERSION = 1

    export class YourEntryPoint {

        private Init(): void {
            console.log("Hello world, I'm compiled from Typescript project!")
            setTimeout(() => {
                alert(`Hello world`) 
                confirm("Do you like this mod?", () => {
                    alert(`thank you`)
                }, 
                () => {
                    alert(`rude`)
                })
                alert(`hello again`)
            }, 3000)
        }

        constructor() {
            OnCampaignStart( () => this.Init() )
        }
    }
    
    new YourEntryPoint()
}