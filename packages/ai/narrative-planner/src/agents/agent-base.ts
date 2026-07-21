import { PlanningContext } from '../planning-context';
import { PlanningSession } from '../planning-session';

export interface AgentResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export abstract class BasePlannerAgent {
  public abstract readonly name: string;
  public abstract readonly stage: string;

  abstract execute(context: PlanningContext, session: PlanningSession): Promise<AgentResult>;

  protected success(): AgentResult {
    return { success: true, errors: [], warnings: [] };
  }

  protected failure(errors: string[], warnings: string[] = []): AgentResult {
    return { success: false, errors, warnings };
  }

  protected partial(warnings: string[]): AgentResult {
    return { success: true, errors: [], warnings };
  }
}
