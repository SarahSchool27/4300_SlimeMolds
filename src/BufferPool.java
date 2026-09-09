import java.util.HashMap;
import java.util.Map;


public class BufferPool {
    private Frame[] frames;// The size of this array is decided at run time.
    HashMap<Integer, Integer> hashMapBlockLocation;

    /** Initialize the full BufferPool including all frames in the frames array.
     * build the array given the input argument, and go over
     * each frame and initialize this frame, e.g., by  initiliazing  each frame.
     *In:
     *  numFrames: The total number of frames the BufferPool will be able to store
     */
    public void BufferPool(int numFrames){
        //TODO check accuracy
        frames = new Frame[numFrames];
        for (int frameI = 0; frameI < numFrames; frameI++) {
            frames[frameI] = new Frame();
        }

        hashMapBlockLocation = new HashMap<>();
        //for every file in Project 1 source
        //add a hashindex.
        //for now we know there a re 7
        //todo: make this more repeatable? low priority
        for (int i = 1; i <= 7; i++) {
            hashMapBlockLocation.put(i,-1); //-1 nothing is in memory right now.
        }

    }


    /** Checks if a given block (file) is available in the buffer pool
     * returns the value in the hashMap
     * input:
     *  (int) targetBlockID: the block Id (file Id),
     * output:
     *  buffer number (slot number in the array) holding the block
     *  or -1 if not available
     */
    public int queryBlockLocation(int targetBlockId){
        return hashMapBlockLocation.get(targetBlockId);
    }


    /**
     * Another method to possibly return the content of a given block Id. This method should also take as
     input the block Id (file Id). Call the method in the previous bullet to know the buffer number (if the
     block is present), and then it can read the content.
     output: block Content or error
     */
    public byte[] getBlockContent(int blockId){
        //query location
        int frameLocation = queryBlockLocation(blockId);

        //if its there return it
        if (frameLocation != -1){
            return getFrameContent(frameLocation);
        }

        //else return error code array
        byte[] errorCode = {-1};

        return errorCode;
    }

    /**
     * Return the content of a given frame.
     * input: frameID
     * output: content of frame
     */
    private byte[] getFrameContent(int frameId){
        return frames[frameId].get();
    }

    /**
     * sets the content of a given frame.
     * updates hashmap for the block searched for.
     * Note: does not change hashmap for old data, assumes the block has been freed or is empty
     * input: frameID
     * output: content of frame
     */
    private void setFrameContent(int frameId, int blockId){
        frames[frameId].set(blockId);
        hashMapBlockLocation.put(blockId,frameId); //Update hashmap
    }

    /** Gets a block from the "disk' and loads it into the BufferPool
     * To be used if the needed blockId is not in the buffer pool.
     * Read the block (file) from disk, and bring it to the buffer pool (in an empty frame)!!!
     * Input:
     *      (int) blockId: the id of the block to load
     * Output: frameId of the placed block. -1 indicates it could not be placed
     */
    public int loadBlock(int blockId){
        //is there an empty frame?
        int emptyIndex = findEmptyFrame();
        if (emptyIndex != -1){
            //if so put it there
            setFrameContent(emptyIndex, blockId);
            return emptyIndex;
        }else{
            //else can I free a frame?
            int freedFrame = makeFreeFrame();
            if(freedFrame != -1){
                //if so put it there
                setFrameContent(freedFrame, blockId);
                return freedFrame;
            }else {
                //else return error
                return -1;
            }
        }
    }

    /**
     * search and give you back a number in the array for an empty frame (if any)
     * output:
     *      int value of an empty frame
     *      or -1: no empty frames
     */
    public int findEmptyFrame(){
        //TODO
        return -1;
    }

    /**
     * If there are no empty frames in the buffer pool, then you may need to take one out and return it back
     * to disk (if possible). This method will differ in how to select this to-be-evicted frame depending on
     * the placement policy.
     * output:
     *      (int) value of a frame that is now free to be overridden.
     *      -1: no frame could be freed. everything is pinned.
     */
    public int makeFreeFrame(){
        /*Select the 1st candidate frame following the last
        frame being evicted. For example, if the last evicted frame is #1, and frames #2 & #3 are pinned, then the
        next frame to be evicted should be frame #4
        o Think of this strategy in a circular fashion. That is if you reach the end of the buffer pool, then you start
        from the beginning again*/
        //TODO clock variant
        return -1;
    }



}
