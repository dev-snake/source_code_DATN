interface Size {
  width?: string | number;
  height?: string | number;
}

const GoogleMap = ({ width = "100%", height = 300 }: Size) => (
  <div>
    <iframe
      className={`rounded-xl`}
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4648.009665625501!2d106.5912695757039!3d10.856395157712209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bd10a236d49%3A0x47bbcdc5db24f31d!2zVHLGsOG7nW5nIE3huqdtIE5vbiBYdcOibiBUaOG7m2kgVGjGsOG7o25n!5e1!3m2!1svi!2s!4v1725804968530!5m2!1svi!2s"
      width={width}
      height={height}
      loading="lazy"
    ></iframe>
  </div>
);

export default GoogleMap;
