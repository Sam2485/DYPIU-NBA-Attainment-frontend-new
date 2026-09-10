import ProgrammeCoordinatorSetupWorkflow from './ProgrammeCoordinatorSetupWorkflow';

export default function ProgrammeIndirectAttainment({
  approvalViewStep = null,
  approvalReadOnly = false,
}) {
  return (
    <ProgrammeCoordinatorSetupWorkflow
      standaloneIndirectAttainment
      approvalViewStep={approvalViewStep}
      approvalReadOnly={approvalReadOnly}
    />
  );
}
