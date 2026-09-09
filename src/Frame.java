public class Frame {
    //holds one disk page

    private boolean dirty;
    private boolean pinned;

    int blockId; //-1 indicates empty
    byte[] content; //4k bytes

    public void Frame(){
        dirty = false;
        pinned = false;

        blockId = -1; //as its currently empty
    }

    /** Sets the content based on the given blockId
     * checks that it actually can be set. (Not pinned)
     * Handles storing data if needed
     * input:
     * - int: newBlockId: the id for the new block to be set
     *
     * output:
     * - int signifying success. 1 for success, -1 for error
     * */
    public int set(int newBlockId){
        //TODO set
        if(pinned == true){ //cannot set a pinned frame
            return 0;
        }
        if(dirty == true){// need to update disk
            //TODO how to update

        }

        //read in new content from blockId
        //TODO how to read from file


       return -1;
    }

    /**Gets the content that is stored in frame
     * Output: byte[] content
     * */
    public byte[] get(){
       return content;
    }

    /**Return a specific record in the block
     Note: all records have the same size of 40 bytes.
     input:
     - int: record number

     output:
     - return the content of this record (string of 40 bytes).
     * */
    public byte[] getRecord(int recordId){
        byte[] record = new byte[40];

        //TODO get specific record from content
        return record;

    }


    /**overwrites a specific record in the block to the given value
     Note: all records have the same size of 40 bytes.

     Changes: sets dirty to true

     input:
     - byte[40]: new value for record

     output:
     - int flag: 1 for success, 0 for error
     * */
    public int setRecord(byte[] newRecordVal){
        //Check that the size of the recordVal is correct

        //overwrite value

        //set dirty flag to true
        //TODO
        return 0;
    }

}
