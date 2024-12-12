interface CustomerLayoutProps{
  foo:string
}

const CustomerLayout = (props:CustomerLayoutProps) => (
  <div className="customer-layout-component">
    {props.foo}
  </div>
);

CustomerLayout.defaultProps = {
  foo: 'bar',
};

 export default CustomerLayout
