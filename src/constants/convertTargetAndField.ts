import { FieldModel, TargetModel } from "../models";

export const convertTargetField = (
  targetId: string,
  targets: TargetModel[],
  fields: FieldModel[]
) => {
  let nameTarget: string = "";
  let fieldId: string = "";
  let nameField: string = ""
  let levelTarget: number = 0
  let contentTarget: string = ''

  const index = targets.findIndex((target) => target.id === targetId);
  if (index !== -1) {
    nameTarget = targets[index].name;
    fieldId = targets[index].fieldId;
    levelTarget = targets[index].level;
    contentTarget = targets[index].content || '';

    const indexField = fields.findIndex(field => field.id === fieldId)
    if (indexField !== -1) {
      nameField = fields[indexField].name
    }
  }

  return { nameTarget, nameField, fieldId , levelTarget, contentTarget};
};
