import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar } from "./Avatar";
import { generateRandomName } from '@/lib/utils'

import styles from './index.module.css';
import { useMemo } from "react";

// The page where you have ActiveUsers info. Though in any page or component you can get the ActiveUsers and CurrentUser info.
// useOthers(): This hook will allow you to get info of other users;
// useSelf(): This hook will allow you to get info of current user;

export const ActiveUsers = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > 3;
    
     // Use useMemo to memoize the users rendering to optimize performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedUsers = useMemo(() => {
        return (
            <div className="flex items-center justify-center gap-1 py-2">
            <div className="flex pl-3">
                {currentUser && (
                  <Avatar name="You" otherStyles="border-[3px] border-primary-green" />
                )}
                {users.slice(0, 3).map(({ connectionId }) => {
                    return (
                    <Avatar key={connectionId} name={generateRandomName()} otherStyles="-ml-3"  />
                    );
                })}
      
                {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
      
            </div>
          </div>
        )
    }, [users.length]);
  
    return memoizedUsers;
  }
  
export default ActiveUsers;