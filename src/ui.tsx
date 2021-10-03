import React, { FC } from "react";
import FullScreen from "./fullscreen";
import { Task, TaskList } from "ink-task-list";

const App: FC = () => (
  <FullScreen>
    <TaskList>
      {/* Pending state */}
      <Task label="Pending" state="pending" />

      {/* Loading state */}
      <Task label="Loading" state="loading" />

      {/* Success state */}
      <Task label="Success" state="success" />

      {/* Warning state */}
      <Task label="Warning" state="warning" />

      {/* Error state */}
      <Task label="Error" state="error" />

      {/* Item with children */}
      <Task label="Item with children" isExpanded>
        <Task label="Loading" state="loading" />
      </Task>
    </TaskList>
  </FullScreen>
);

export default App;
