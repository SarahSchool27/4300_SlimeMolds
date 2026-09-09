


public class BufferManager {
    static BufferPool bufferPool;
    static byte[] CONTENT_ERROR = {-1};

    /* the program should take an input argument that decides
    the size of the buffer pool array*/
    public static void main (String[] args){
        //read program arguments
        int numFrames;
        try {
            numFrames = Integer.parseInt(args[0]);
        } catch (NumberFormatException e){
            System.out.println("Invalid argument. Expecting an integer for the number of frames in the buffer.");
            throw e;
        }

        System.out.println(numFrames);

        //init variables
        bufferPool = new BufferPool();



    }

    /**
     * Print the content of given record
     * Calls the BufferPool to read the correct file and prints the results.
     * Four cases:
     *      case1: file in memory. read from memory
     *      case2: file not in memory, empty frames. add frame and read from it
     *      case3: file not in memory, buffer full but can be freed. search for available and overwrite(and update if dirty)
     *      case4: file not in memory, buffer fully pinned. return error message
     * Input: recordID of desired record
     * Output: no returned value
     * Prints:
     *      (1)Print the record content (the 40 bytes) for CASEs #1, 2, 3 above, or the message indicated in CASE #4
     *      (2) Print whether or not an I/O is done (i.e., whether the block was already in memory or brought from disk)
     *       (3) Print the frame# (the entry number in the buffers array) that contains the block (for CASES #1,2,3
     */

    public static void getBlock(int recordID){
        //get block ID
        int blockId = getBlockIdfromRecordId(recordID);
        //is query in memory already? Attempt read.
        byte[] content = bufferPool.getBlockContent(blockId);
        if (content != CONTENT_ERROR){//if it is in memory
            //then content is our target.
            //TODO print content

        }else{ //block NOT in memory already
            //else ask to loadBlock
            if(bufferPool.loadBlock(blockId) != -1){ //able to load
                content = bufferPool.getBlockContent(blockId); //get it again (garunteed non -1 result)

                if (content == CONTENT_ERROR){//if it is in memory
                    throw new Error("getBlock loaded a block into bufferPool and then could not find its location.");
                }
            }else{ //failed to load because loadBlock failed
                //TODO else failure message

            }
        }
    }

    /**
     * Find the blockId the record is in.
     * input: target recordId
     * output: blockId the record appears in.
     */
    public static int getBlockIdfromRecordId(int recordId){
        // TODO calculate which block contains this record
        //make sure valid else also throw -1 or error.
        return -1;
    }

}