import React, { FC } from "react";
import API, { FirebaseState } from "./api";
import * as ip from "ip";
import _ from "lodash";
import importedShuffle from "fast-shuffle";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shuffle: any = importedShuffle; // types are wrong.

import { getStartOfDayEST } from "./helpers";

// All the types
export type User = {
  username: string;
  checkedIn: number;
  ip: string;
};

export type Restaurant = {
  id: number;
  name: string;
  website: string;
  price: number;
};

export type Vote = {
  username: string;
  optionId: number;
  yes: boolean;
  date: number;
};

export type State = {
  currentOption: RestaurantWithStatus | null | undefined;
  users: User[];
  checkedInUsers: User[];
  votesForCurrentOption: Vote[];
  me: User | null;
  gracePeriodEnd: number | null;
  setUsername: (username: string) => void;
};

export type RestaurantWithStatus = {
  restaurant: Restaurant;
  chosen: boolean | null;
};

const defaultState: State = {
  currentOption: null,
  users: [],
  me: null,
  checkedInUsers: [],
  votesForCurrentOption: [],
  gracePeriodEnd: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUsername: () => {},
};

// Three minutes
const gracePeriod = 1000 * 60 * 3;

export const StateContext = React.createContext<State>(defaultState);

export const StateProvider: FC = ({ children }) => {
  const [firebaseState, setFirebaseState] =
    React.useState<FirebaseState | null>(null);

  const [username, setUsername] = React.useState<string | null>(null);

  const state = React.useMemo<State>(() => {
    if (!firebaseState) {
      return defaultState;
    } else {
      // map firebase state to State
      const startOfDayEST = getStartOfDayEST();
      // shuffled options
      const options: Restaurant[] = shuffle(startOfDayEST)(
        [
          {
            id: 1,
            name: "First option",
            website: "https://www.stillOnATest",
            price: 2,
          },
          {
            id: 2,
            name: "Second option",
            website: "https://www.stillOnATest",
            price: 2,
          },
          {
            id: 3,
            name: "Third option",
            website: "https://www.stillOnATest",
            price: 4,
          },
          {
            id: 4,
            name: "Fourth option",
            website: "https://www.stillOnATest",
            price: 4,
          },
        ],
        () => startOfDayEST
      );

      const todaysVotes =
        _.filter(firebaseState.votes, (vote) => vote.date > startOfDayEST) ||
        [];

      const restaurantsWithStatus: RestaurantWithStatus[] = options.map(
        (option) => {
          const votesForOption =
            _.filter(todaysVotes, (vote) => vote.optionId === option.id) || [];
          // If there are more votes than the quorumSize
          const quorumSize = firebaseState.quorumSize;
          if (votesForOption.length >= quorumSize) {
            // count the votes
            let yays = 0;
            let nays = 0;
            const orderedVotes = _.sortBy(votesForOption, ["date"]);

            // Count the votes that are in the quorum.
            const quorumVotes = _.take(orderedVotes, quorumSize);
            quorumVotes.forEach((vote) => {
              if (vote.yes) {
                yays++;
              } else {
                nays++;
              }
            });

            //Every vote after the quorum has to have been taken within the grace period.
            const orderedVotesWithoutQuorum = _.drop(orderedVotes, quorumSize);
            let quorumDate = _.last(quorumVotes)?.date || 0;
            if (orderedVotesWithoutQuorum?.length) {
              quorumDate = orderedVotesWithoutQuorum[0]?.date || 0;

              for (const vote of orderedVotesWithoutQuorum) {
                if (vote.date <= quorumDate + gracePeriod) {
                  if (vote.yes) {
                    yays++;
                  } else {
                    nays++;
                  }
                } else {
                  break;
                }
                quorumDate = vote.date;
              }
            }
            if (new Date().getTime() > quorumDate + gracePeriod) {
              return { restaurant: option, chosen: yays > nays };
            }
          }
          return { restaurant: option, chosen: null };
        }
      );

      // current Restaurant
      // Current restaurant is the first option that is not decided or was chosen
      const currentOption = _.find(
        restaurantsWithStatus,
        (rs) => rs.chosen || rs.chosen === null
      );
      const votesForCurrentOption =
        _.filter(
          todaysVotes,
          (vote) => vote.optionId === currentOption?.restaurant.id
        ) || [];

      const calcState: State = {
        currentOption: currentOption,
        me: _.chain(firebaseState.users)
          .filter((user) =>
            username ? user.username === username : user.ip === ip.address()
          )
          .orderBy(["checkedIn"], ["desc"])
          .first()
          .value(),
        users: _.sortBy(firebaseState.users, ["username"]) ?? [],
        checkedInUsers:
          _.sortBy(firebaseState.checkedInUsers, ["username"]) ?? [],
        votesForCurrentOption,
        gracePeriodEnd:
          votesForCurrentOption?.length >= firebaseState.quorumSize
            ? _.chain(votesForCurrentOption).sortBy("date").last().value()
                .date + gracePeriod
            : null,
        setUsername: setUsername,
      };
      return calcState;
    }
  }, [firebaseState, username]);

  React.useEffect(() => {
    const detach = API.getState((firebaseState) => {
      setFirebaseState(firebaseState);
    });
    return () => {
      detach();
    };
  }, []);

  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
};

export const useRemote = (): State => React.useContext(StateContext);
