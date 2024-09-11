const emailTemplate = (name, apps) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Simple Transactional Email</title>
    <style media="all" type="text/css">
      @media (max-width: 768px) {
        #reminder-svg {
          width: 100%; /* SVG takes full width on small screens */
          height: auto;
          position: static; /* No absolute positioning on small screens */
          margin-top: 1rem;
        }
        #reminder-text {
          font-size: 1rem;
          max-width: 16rem;
          color: white;
          display: none;
          /* padding-left: 2.8125rem; */
        }

        #reminder-bg {
          background-color: white;
        }
      }
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }

        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
      @media only screen and (max-width: 640px) {
        .main p,
        .main td,
        .main span {
          font-size: 16px !important;
        }

        .wrapper {
          padding: 8px !important;
        }

        .content {
          padding: 0 !important;
        }

        .container {
          padding: 0 !important;
          padding-top: 8px !important;
          width: 100% !important;
        }

        .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }

        .btn table {
          max-width: 100% !important;
          width: 100% !important;
        }

        .btn a {
          font-size: 16px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      }
      @media all {
        .ExternalClass {
          width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }

        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }

        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      }
    </style>
  </head>
  <body
    style="
      font-family: Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.3;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      background-color: #f4f5f6;
      border-top: 0.5rem;
      border-color: #4336f3;
      padding: 0;
      margin: 0;
    "
  >
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      class="body"
      style="
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #f4f5f6;
        width: 100%;
      "
      width="100%"
      bgcolor="#f4f5f6"
    >
      <tr>
        <td
          style="
            font-family: Helvetica, sans-serif;
            font-size: 16px;
            vertical-align: top;
          "
          valign="top"
        >
          &nbsp;
        </td>

        <td
          class="container"
          style="
            font-family: Helvetica, sans-serif;
            font-size: 16px;
            vertical-align: top;
            max-width: 780px;
            padding: 0;
            padding-top: 24px;
            /* width: 780px; */
            margin: 0 auto;
          "
          valign="top"
        >
          <div
            class="content"
            style="
              box-sizing: border-box;
              display: block;
              margin: 0 auto;
              max-width: 780px;
              padding: 0;
            "
          >
            <!-- START CENTERED WHITE CONTAINER -->

            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              class="main"
              style="background: #ffffff; width: 100%; border-color: #4336f3"
              width="100%"
            >
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td
                  style="
                    border-top: #4336f3 solid 8px;
                    direction: ltr;
                    font-size: 0px;
                    text-align: center;
                    vertical-align: top;
                  "
                ></td>
              </tr>
              <tr>
                <td
                  class="wrapper"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 16px;
                    vertical-align: top;
                    box-sizing: border-box;
                    padding: 0px 24px;
                  "
                  valign="top"
                >
                     <table>
                    <tr
                      style="color: #2b2b2b; font-weight: 600; font-size: 1rem"
                    >
                      <td style="text-align: center">
                        <img
                          src="https://res.cloudinary.com/dgeyvw1he/image/upload/v1726071855/circle-dollar_jblack.png"
                          alt="app icon"
                          width="28"
                          height="28"
                        />
                      </td>
                      <td style="text-align: center">
                        <h1>Reminderoo</h1>
                      </td>
                    </tr>
                  </table>
                  <table
                    role="presentation"
                    style="
                      width: 100%;
                      max-width: 46rem;
                      margin: 0 auto;
                      background-color: #827aff;
                      border-collapse: collapse;
                      margin-bottom: 22px;
                    "
                  >
                    <tr>
                      <td
                        style="
                          padding: 2rem;
                          color: white;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                      >
                        <h1 style="font-size: 3rem; margin: 0">
                          Payment Reminder
                        </h1>
                      </td>
                      <!-- </tr> -->
                      <!-- <tr> -->
                      <td style="text-align: center; padding: 1rem">
                        <img
                          src="https://res.cloudinary.com/dgeyvw1he/image/upload/v1726061518/email-img_zevvrn.png"
                          alt="Payment Reminder"
                          style="max-width: 100%; height: auto"
                        />
                      </td>
                    </tr>
                  </table>
                  <p
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 16px;
                      font-weight: normal;
                      margin: 0;
                      margin-bottom: 16px;
                    "
                  >
                    Hi, ${name}
                  </p>

                  <p
                    style="
                      font-family: Helvetica, sans-serif;
                      font-size: 16px;
                      font-weight: normal;
                      margin: 0;
                      margin-bottom: 16px;
                    "
                  >
                    Time flies when you&apos;re using ${
                      apps[0].app_name
                    }, right? This
                    is a friendly reminder to let you know that your
                    ${apps[0].app_name} subscription will expire in
                    <span style="color: #f20505; font-weight: bold">
                      ${Math.floor(
                        (new Date(apps[0].next_payment) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}
                      Days
                    </span>
                    on ${new Date(apps[0].next_payment).toLocaleDateString(
                      "id",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}}.
                  </p>

                  <p
                    style="
                      font-family: Helvetica, sans-serif;
                      font-size: 16px;
                      font-weight: normal;
                      margin: 0;
                      margin-bottom: 16px;
                    "
                  >
                    What You Need to Know:
                  </p>
                  <ul>
                    <li>
                      Renewal Status: Please update your subscription status
                      after make the payment
                    </li>
                    <li>
                      Cancellation: If you wish to cancel or make changes to
                      your subscription, please do so before the renewal date to
                      avoid any changes
                    </li>
                  </ul>

                  <p>Need Help?</p>
                  <p>
                    If you have any questions or need assistance, feel free to
                    reach out to our support team at [Support Email] or visit
                    our Help Center.
                  </p>

                  <p>
                    Thank you for using our platform to manage your
                    subscriptions. We&apos;re here to make your life easier!
                  </p>

                  <div>
                    <p>
                      Best Regards,
                      <br />
                      <span style="font-weight: bold">Reminderoo Team</span>
                    </p>
                  </div>

                  <section
                    style="width: 100%"
                  >
                  ${apps.map((data) => {
                    return `
                    <table
                      style="
                        width: 100%;
                        border-spacing: 0;
                        border-collapse: collapse;
                        margin-bottom: 1rem;
                      "
                      role="presentation"
                    >
                      <tr>
                        <td style="background-color: #f6f6f6; padding: 1rem">
                          <table
                            style="
                              width: 100%;
                              border-spacing: 0;
                              border-collapse: collapse;
                            "
                            role="presentation"
                          >
                            <tr>
                              <td
                                style="
                                  font-weight: 500;
                                  font-size: 0.875rem;
                                  color: #565656;
                                  padding: 0 1rem;
                                "
                              >
                                <p>Subscription Name</p>
                                <p>Category</p>
                                <p>Price</p>
                                <p>Cycle</p>
                                <p>Start Payment</p>
                                <p>Next Payment</p>
                                <p>Payment Method</p>
                              </td>
                              <td
                                style="
                                  font-weight: 500;
                                  font-size: 0.875rem;
                                  color: #090909;
                                  padding: 0 1rem;
                                "
                              >
                                <p>${data?.app_name}</p>
                                <p>${data?.category}</p>
                                <p>
                                  ${new Intl.NumberFormat("ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(data?.pricing * 1000)}
                                </p>
                                <p>${data?.cycle}</p>
                                <p>
                                  ${new Date(
                                    data?.start_payment
                                  ).toLocaleDateString("id", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                                <p>
                                  ${new Date(
                                    data?.next_payment
                                  ).toLocaleDateString("id", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                                <p>${data?.payment_method}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>`;
                  })}
                    
                  </section>
<p>
                    You can view your subscription details
                    <a
                      href=${`reminderoo.vercel.app/dashboard`}
                      style="color: #1197f8; text-decoration: underline"
                      >here</a
                    >
                  </p>
                  
                </td>
              </tr>

              <!-- END MAIN CONTENT AREA -->
            </table>

           

            <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td
          style="
            font-family: Helvetica, sans-serif;
            font-size: 16px;
            vertical-align: top;
          "
          valign="top"
        >
          &nbsp;
        </td>
      </tr>
    </table>
  </body>
</html>`;

module.exports = { emailTemplate };
