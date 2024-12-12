import { Button } from '@nextui-org/react';

interface DesignSystemProps {
	foo: string;
}

const DesignSystem = (props: DesignSystemProps) => (
	<div className="w-screen h-screen flex flex-col gap-8">
		<div className={'w-full flex flex-col gap-4'}>
			<h1>List Button</h1>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Solid:</h6>
				<Button color={'default'}>Button</Button>
				<Button color={'primary'}>Button</Button>
				<Button color={'secondary'}>Button</Button>
				<Button color={'success'}>Button</Button>
				<Button color={'warning'}>Button</Button>
				<Button color={'danger'}>Button</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Faded:</h6>
				<Button variant={'faded'} color={'default'}>
					Button
				</Button>
				<Button variant={'faded'} color={'primary'}>
					Button
				</Button>
				<Button variant={'faded'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'faded'} color={'success'}>
					Button
				</Button>
				<Button variant={'faded'} color={'warning'}>
					Button
				</Button>
				<Button variant={'faded'} color={'danger'}>
					Button
				</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Bordered:</h6>
				<Button variant={'bordered'} color={'default'}>
					Button
				</Button>
				<Button variant={'bordered'} color={'primary'}>
					Button
				</Button>
				<Button variant={'bordered'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'bordered'} color={'success'}>
					Button
				</Button>
				<Button variant={'bordered'} color={'warning'}>
					Button
				</Button>
				<Button variant={'bordered'} color={'danger'}>
					Button
				</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Light:</h6>
				<Button variant={'light'} color={'default'}>
					Button
				</Button>
				<Button variant={'light'} color={'primary'}>
					Button
				</Button>
				<Button variant={'light'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'light'} color={'success'}>
					Button
				</Button>
				<Button variant={'light'} color={'warning'}>
					Button
				</Button>
				<Button variant={'light'} color={'danger'}>
					Button
				</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Flat:</h6>
				<Button variant={'flat'} color={'default'}>
					Button
				</Button>
				<Button variant={'flat'} color={'primary'}>
					Button
				</Button>
				<Button variant={'flat'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'flat'} color={'success'}>
					Button
				</Button>
				<Button variant={'flat'} color={'warning'}>
					Button
				</Button>
				<Button variant={'flat'} color={'danger'}>
					Button
				</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Ghost:</h6>
				<Button variant={'ghost'} color={'default'}>
					Button
				</Button>
				<Button variant={'ghost'} color={'primary'}>
					Button
				</Button>
				<Button variant={'ghost'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'ghost'} color={'success'}>
					Button
				</Button>
				<Button variant={'ghost'} color={'warning'}>
					Button
				</Button>
				<Button variant={'ghost'} color={'danger'}>
					Button
				</Button>
			</div>
			<div className={'w-full flex items-center gap-2'}>
				<h6>Shadow:</h6>
				<Button variant={'shadow'} color={'default'}>
					Button
				</Button>
				<Button variant={'shadow'} color={'primary'}>
					Button
				</Button>
				<Button variant={'shadow'} color={'secondary'}>
					Button
				</Button>
				<Button variant={'shadow'} color={'success'}>
					Button
				</Button>
				<Button variant={'shadow'} color={'warning'}>
					Button
				</Button>
				<Button variant={'shadow'} color={'danger'}>
					Button
				</Button>
			</div>
		</div>
		<div className={'w-full flex flex-col gap-4'}>
			<h1>List Heading & Paragraph</h1>
			<div className={'w-full flex flex-col gap-2'}>
				<h1>Heading 1</h1>
				<h2>Heading 2</h2>
				<h3>Heading 3</h3>
				<h4>Heading 4</h4>
				<h5>Heading 5</h5>
				<h6>Heading 6</h6>
				<p>Text base</p>
				<p className={'small'}>Text small</p>
				<p className={'tiny'}>Text tiny / extra-small</p>
			</div>
		</div>
	</div>
);

DesignSystem.defaultProps = {
	foo: 'bar'
};

export default DesignSystem;
