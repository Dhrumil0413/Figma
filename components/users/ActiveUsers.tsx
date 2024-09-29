import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar } from "./Avatar";

import styles from './index.module.css';

// The page where you have ActiveUsers info. Though in any page or component you can get the ActiveUsers and CurrentUser info.
// useOthers(): This hook will allow you to get info of other users;
// useSelf(): This hook will allow you to get info of current user;

export const ActiveUsers = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > 3;
  
    return (
      <main className="flex h-screen w-full select-none place-content-center place-items-center">
        <div className="flex pl-3">
            {currentUser && (
              <Avatar name="You" otherStyles="border-[3px] border-primary-green" />
            )}
            {users.slice(0, 3).map(({ connectionId, info }) => {
                return (
                <Avatar key={connectionId} otherStyles="border-[3px] border-primary-green"  />
                );
            })}
  
            {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
  
        </div>
      </main>
    );
  }
  
export default ActiveUsers;