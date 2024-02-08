
/**
 * Assume raw row inputs are in a JSON object in the form
 * of jsonObject[colName] = value
 * 
 * This class is immutable. Set the values in the constructor.
 */
export default class Row{
    public readonly fileName:string;
    public readonly recording:string;
    public readonly latitude:number;
    public readonly longitude:number;
    public readonly speciesEnglishName:string;
    public readonly speciesLatinName:string;
    public readonly speciesGroup:string;
    public readonly probability:number;
    public readonly warnings:string;
    public readonly callType:string;
    public readonly timestamp:number;
    public readonly projectDate:string;
    public readonly projectName:string;
    public readonly classifierName:string;
    public readonly batchName:string;
    public readonly userID:string;

    public constructor(rawRow:any){
        /**
         * TODO: PARSE THESE FROM rawRow
         */
        this.fileName = "";
        this.recording = "";
        this.latitude = 0;
        this.longitude = 0;
        this.speciesEnglishName = "";
        this.speciesLatinName = "";
        this.speciesGroup = "";
        this.probability = 0;
        this.warnings = "";
        this.callType = "";
        this.timestamp = 0;
        this.projectDate = "";
        this.projectName = "";
        this.classifierName = "";
        this.batchName = "";
        this.userID = "";
    }
}