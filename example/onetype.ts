export interface NestedType {
    id: number
    value: string
}

export default interface OneType {
    someProp: number;
    otherProp: NestedType;
}
