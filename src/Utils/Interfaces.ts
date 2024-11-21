
//================================
//========== CLASSES =============  
//================================

export interface Destroyable
{
    destroy() : void
}

//================================
//========== FUNCTIONS ============
//================================

export interface UpdateFunction {
    (deltaTime : number) : void
}

export interface ConditionFunction {
    (): boolean
}