import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { STORAGE_UNITS, TIME_UNITS } from "@paperplane/utils";
import type React from "react";

interface Props {
	isOpen: boolean;
	onClick: () => void;

	isNew?: boolean;
}

export const CreateUserModal: React.FC<Props> = ({ isNew, isOpen, onClick }) => {
	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="max-w-[50vw]">
				<div>
					{isNew ? (
						<>
							<h1 className="text-3xl">Create a new PaperPlane account</h1>
							<p className="text-base max-w-[90%]">
								Creating an account as admin is always possible, keep in mind that you cannot set a password get access to 2FA code.
								The user will have to use the default back-up code <strong>paperplane-cdn</strong> to login.
							</p>
						</>
					) : (
						<h1 className="text-3xl">Update a PaperPlane account</h1>
					)}
				</div>
				<ul className="w-full mt-4 max-h-[50vh] pr-2 overflow-y-auto">
					<li className="w-full">
						<h2 className="text-lg">Choose a domain</h2>
						<div className="flex items-center gap-2 w-full">
							<Input type="tertiary" placeholder="Not available" />
							<SelectMenu type="tertiary" placeholder="Select a domain" className="w-full" />
						</div>
					</li>
					<li className="w-full mt-4">
						<div className="mb-2">
							<h2 className="text-lg">Max Storage</h2>
							<p className="text-base">
								This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a reverse-proxy
								like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
							</p>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Input
								type="tertiary"
								formType="number"
								inputMode="decimal"
								placeholder="Storage amount, 0=infinitive"
								className="w-3/4"
							/>
							<SelectMenu
								type="tertiary"
								placeholder="Select a unit"
								className="w-1/4"
								options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
								defaultValue={{ label: "GB", value: "GB" }}
							/>
						</div>
					</li>
					<li className="w-full mt-4">
						<div className="mb-2">
							<h2 className="text-lg">Max Upload Size</h2>
							<p className="text-base">
								This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a reverse-proxy
								like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
							</p>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Input
								type="tertiary"
								formType="number"
								inputMode="decimal"
								placeholder="upload size amount, 0=infinitive"
								className="w-3/4"
							/>
							<SelectMenu
								type="tertiary"
								placeholder="Select a unit"
								className="w-1/4"
								options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
								defaultValue={{ label: "GB", value: "GB" }}
							/>
						</div>
					</li>
					<li className="w-full mt-4">
						<div className="mb-2">
							<h2 className="text-lg">(Dis)Allowed Extensions</h2>
							<p className="text-base">
								This will allow you to accept/block the upload of certain file extensions (e.x. .png). Please use the following format
								when using this: <strong>{".<extension>,.<extension>,...etc (e.x.: .png,.jpg)."}</strong>
							</p>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Input
								type="tertiary"
								formType="text"
								inputMode="text"
								placeholder=".<extension>,...etc (e.x.: .png,.jpg)"
								className="w-3/4"
							/>
							<SelectMenu
								type="tertiary"
								placeholder="Select a mode"
								className="w-1/4"
								options={[
									{ label: "Mode: block", value: "block" },
									{ label: "Mode: pass", value: "pass" }
								]}
								defaultValue={{ label: "Mode: block", value: "block" }}
							/>
						</div>
					</li>
					<li className="w-full mt-4">
						<div className="mb-2">
							<h2 className="text-lg">Audit Log Duration</h2>
							<p className="text-base">
								This will determine the for how long the audit logs are visible. By default it is set to 1 month, you can use{" "}
								<strong>0</strong> to set it to infinitive (not recommended).
							</p>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Input type="tertiary" formType="number" inputMode="decimal" placeholder="Duration, 0=infinitive" className="w-3/4" />
							<SelectMenu
								type="tertiary"
								placeholder="Select a unit"
								className="w-1/4"
								options={TIME_UNITS}
								defaultValue={{ label: "Days", value: "d" }}
							/>
						</div>
					</li>
				</ul>
				<PrimaryButton type="button" className="mt-4">
					Create new user
				</PrimaryButton>
			</div>
		</Modal>
	);
};
